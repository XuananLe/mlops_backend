import config from '#src/config/config.js'
import mongoose from 'mongoose'
import { UploadTypes, ALLOWED_FILE_EXTENSIONS, GCS_HOST } from '../data/constants.js'
import LabelService from './label.service.js'
import { getLabelAndFilePath, randomUID } from '../utils/string.util.js'
import Project from '../models/project.model.js'
import Dataset from '../models/dataset.model.js'
import Image from '../models/image.model.js'

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

    const dataset = new Dataset({
      key: `label/${projectID}`,
      pattern: `gs://${config.storageBucketName}/label/${projectID}/*/*`,
      project_id: projectID,
    })
    await dataset.save()

    const uploadedFilesInfo = await insertUploadedFiles(uploadedFiles, projectID, dataset._id)
    return { files: uploadedFilesInfo, labels }
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const insertUploadedFiles = async (uploadedFiles, projectID, datasetID) => {
  const imageURLPrefix = `${GCS_HOST}/${config.storageBucketName}`
  const insertingFiles = []
  const uploadedFilesInfo = []
  try {
    const labelMap = await LabelService.GetLabelMap(projectID)
    uploadedFiles.forEach((file) => {
      const uid = randomUID()
      const baseInfo = {
        name: file.name,
        project_id: projectID,
        uid,
      }
      insertingFiles.push({
        ...baseInfo,
        url: `${imageURLPrefix}/images/${file.key}`,
        is_original: true,
      })

      const labelingImage = {
        ...baseInfo,
        url: `${imageURLPrefix}/label/${file.key}`,
        is_original: false,
        dataset_id: datasetID,
      }
      if (file.label.length > 0) {
        labelingImage.label_id = labelMap[file.label]
      }
      insertingFiles.push(labelingImage)
      uploadedFilesInfo.push({ url: labelingImage.url, label: file.label, uid })
    })
    await Image.insertMany(insertingFiles)
  } catch (error) {
    console.error(error)
    throw new Error(error)
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
  const batchSize = 32
  const uploadedFiles = []
  for (let i = 0; i < files.length; i += batchSize) {
    const promises = files
      .slice(i, i + batchSize)
      .map((file) => uploadFile(file, projectID, uploadType))
    const results = await Promise.allSettled(promises)
    results.forEach((result) => {
      if (result.status !== 'fulfilled') {
        console.error(result.reason)
      }
      uploadedFiles.push(result.value)
    })
    console.log(`#${i / 32 + 1} - [${i} to ${i + batchSize}]: Upload done`)
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
  const copyOptions = {
    preconditionOpts: {
      ifGenerationMatch: 0,
    },
  }
  try {
    await config.storageBucket.file(srcFileName).copy(copyDestination, copyOptions)
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const moveFile = async (srcFileName, destFileName) => {
  const moveOptions = {
    preconditionOpts: {
      ifGenerationMatch: 0,
    },
  }
  try {
    await config.storageBucket.file(srcFileName).move(destFileName, moveOptions)
    console.log(
      `gs://${config.storageBucketName}/${srcFileName} moved to gs://${config.storageBucketName}/${destFileName}`
    )
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const deleteFile = async (fileName) => {
  const deleteOptions = {
    ifGenerationMatch: generationMatchPrecondition,
  }
  try {
    await config.storageBucket.file(fileName).delete(deleteOptions)
    console.log(`gs://${config.storageBucketName}/${fileName} deleted`)
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

export { UploadFiles }
