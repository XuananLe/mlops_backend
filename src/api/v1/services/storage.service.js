import config from '#src/config/config.js'
import path from 'path'
import mongoose from 'mongoose'
import {
  UploadTypes,
  ALLOWED_FILE_EXTENSIONS,
  GCS_HOST,
  UPLOAD_BATCH_SIZE,
  FILE_NAME_LEN,
} from '../data/constants.js'
import LabelService from './label.service.js'
import { getLabelAndFilePath, randomString, randomUID } from '../utils/string.util.js'
import Image from '../models/image.model.js'
import DatasetService from './dataset.service.js'
import ProjectService from './project.service.js'

const UploadFiles = async (projectID, files, uploadType) => {
  try {
    const { labels, validFiles } = parseAndValidateFiles(files, uploadType)
    const uploadedFiles = await uploadFilesToGCS(validFiles, projectID, uploadType)

    // Upload folder
    if (labels.length > 0) {
      const insertingLabels = labels.map((label) => ({
        project_id: projectID,
        name: label,
      }))
      await LabelService.UpsertAll(projectID, insertingLabels)
    }
    const labelMap = await LabelService.GetLabelMap(projectID)
    const datasetInfo = {
      key: `label/${projectID}`,
      pattern: `gs://${config.storageBucketName}/label/${projectID}`,
      project_id: projectID,
    }
    const dataset = await DatasetService.Upsert(datasetInfo)

    const uploadedFilesInfo = await insertUploadedFiles(
      uploadedFiles,
      projectID,
      dataset._id,
      labelMap
    )
    // Convert label map to array of labels: { id, value }
    const labelsWithID = Object.entries(labelMap).map(([label, id]) => {
      return { id: id.toString(), value: label }
    })

    // Update project thumbnail
    const thumbnailURL = uploadedFilesInfo[0].url
    await ProjectService.Update(projectID, { thumbnail_url: thumbnailURL })
    return { files: uploadedFilesInfo, labels: labelsWithID }
  } catch (error) {
    console.error(error)
    throw error
  }
}

const DeleteFiles = async (keys) => {
  const successFiles = []
  const errorFiles = []
  try {
    const promises = keys.map((key) => deleteFile(key))
    const results = await Promise.allSettled(promises)
    // TODO: handle error
    results.forEach((result, idx) => {
      if (result.status !== 'fulfilled') {
        console.error(result.reason)
        errorFiles.push(keys[idx])
      } else {
        successFiles.push(keys[idx])
      }
    })
    console.log(
      `${successFiles.length} file(s) deleted successfully, ${errorFiles.length} error(s).`
    )
  } catch (error) {
    console.error(error)
    throw error
  }
}

const insertUploadedFiles = async (uploadedFiles, projectID, datasetID, labelMap) => {
  const imageURLPrefix = `${GCS_HOST}/${config.storageBucketName}`
  const insertingFiles = []
  const uploadedFilesInfo = []
  try {
    uploadedFiles.forEach((file) => {
      const uid = randomUID()
      const labelingImageID = new mongoose.Types.ObjectId()
      const baseInfo = {
        name: file.name,
        project_id: projectID,
        uid,
      }
      insertingFiles.push({
        ...baseInfo,
        key: `images/${file.key}`,
        url: `${imageURLPrefix}/images/${file.key}`,
        is_original: true,
      })

      const labelingImage = {
        ...baseInfo,
        _id: labelingImageID,
        key: `label/${file.key}`,
        url: `${imageURLPrefix}/label/${file.key}`,
        is_original: false,
        dataset_id: datasetID,
      }

      let labelID = ''
      if (file.label.length > 0) {
        labelID = labelMap[file.label]
        labelingImage.label_id = labelID
      }
      insertingFiles.push(labelingImage)
      uploadedFilesInfo.push({
        _id: labelingImageID,
        label: file.label,
        label_id: labelID,
        uid,
        url: labelingImage.url,
      })
    })
    await Image.insertMany(insertingFiles)
  } catch (error) {
    console.error(error)
    throw error
  }
  return uploadedFilesInfo
}

const parseAndValidateFiles = (files, uploadType) => {
  const validFiles = []
  const labels = []
  for (let i = 0; i < files.length; i++) {
    if (uploadType == UploadTypes.FOLDER) {
      // Decode base64
      const originalFileName = Buffer.from(files[i].name, 'base64').toString('ascii')
      const { label, path } = getLabelAndFilePath(originalFileName)
      if (labels.indexOf(label) < 0) {
        labels.push(label)
      }
      files[i].name = path
    }
    const fileName = files[i].name
    if (fileName.startsWith('.')) {
      continue
    }
    if (isAllowedExtension(fileName)) {
      files[i].name = generateUniqueFileName(files[i].name)
      validFiles.push(files[i])
    } else {
      console.error('File extension not supported: ', fileName)
      throw new Error('File extension not supported')
    }
  }
  return { labels, validFiles }
}

const isAllowedExtension = (fileName) => {
  const idx = fileName.lastIndexOf('.')
  if (idx <= 0) {
    return false
  }
  const ext = fileName.substring(idx + 1, fileName.length)
  return ALLOWED_FILE_EXTENSIONS.includes(ext)
}

// TODO: using socket for realtime rendering
const uploadFilesToGCS = async (files, projectID, uploadType) => {
  const timeNowUnix = new Date().getTime()
  const uploadedFiles = []
  for (let i = 0; i < files.length; i += UPLOAD_BATCH_SIZE) {
    const promises = files
      .slice(i, i + UPLOAD_BATCH_SIZE)
      .map((file) => uploadFile(file, projectID, uploadType))
    const results = await Promise.allSettled(promises)
    results.forEach((result) => {
      if (result.status !== 'fulfilled') {
        console.error(result.reason)
      }
      uploadedFiles.push(result.value)
    })
    console.log(`#${i / UPLOAD_BATCH_SIZE + 1} - [${i} to ${i + UPLOAD_BATCH_SIZE}]: Upload done`)
  }
  const doneTime = new Date().getTime()
  const timeDiff = (doneTime - timeNowUnix) / 1000
  console.log(`Successfully uploaded ${files.length} file(s), total time: ${timeDiff} seconds`)
  return uploadedFiles
}

const uploadFile = async (file, projectID, uploadType) => {
  const fileName = file.name
  // TODO: add time unix to file name, make public at file level
  const keyWithoutPrefix = `${projectID}/${fileName}`
  const objKey = `images/${keyWithoutPrefix}`
  const datasetKey = `label/${keyWithoutPrefix}`
  try {
    await config.storageBucket.file(objKey).save(file.data)
    const paths = fileName.split('/')
    const name = paths[paths.length - 1]
    let label = ''
    if (uploadType == UploadTypes.FOLDER) {
      // TODO: ensure paths.length > 2
      label = paths[paths.length - 2]
    }
    await copyFile(objKey, datasetKey)
    return { key: keyWithoutPrefix, name, label }
  } catch (error) {
    console.error(error)
    Promise.reject(new Error(err))
  }
}

const copyFile = async (srcFileName, destFileName) => {
  const copyDestination = config.storageBucket.file(destFileName)
  try {
    await config.storageBucket.file(srcFileName).copy(copyDestination)
  } catch (error) {
    console.error(error)
    throw error
  }
}

const MoveFile = async (srcFileName, destFileName) => {
  try {
    await config.storageBucket.file(srcFileName).move(destFileName)
    console.log(
      `gs://${config.storageBucketName}/${srcFileName} moved to gs://${config.storageBucketName}/${destFileName}`
    )
  } catch (error) {
    console.error(error)
    throw error
  }
}

const deleteFile = async (fileObjKey) => {
  try {
    await config.storageBucket.file(fileObjKey).delete()
    console.log(`gs://${config.storageBucketName}/${fileObjKey} deleted`)
  } catch (error) {
    console.error(error)
    throw error
  }
}

const generateUniqueFileName = (originalFileName) => {
  let paths = originalFileName.split('/')
  const extension = path.extname(paths[paths.length - 1])
  paths = paths.slice(0, -1)
  paths.push(randomString(FILE_NAME_LEN))
  const fileName = paths.join('/')
  return `${fileName}${extension}`
}

// const generateUniqueFileName = (originalFileName) => {
//   const { dir, name, ext } = path.parse(originalFileName)
//   const uniqueFileName = randomString(20)
//   return `${dir}/${uniqueFileName}${ext}`
// }

const StorageService = { UploadFiles, DeleteFiles, MoveFile }
export default StorageService
