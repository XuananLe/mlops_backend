import config from '#src/config/config.js'
import { UploadTypes, ALLOWED_FILE_EXTENSIONS, GCS_HOST } from '../data/constants.js'
import LabelService from './label.service.js'
import { getLabelAndFilePath } from '../utils/string.util.js'
import Dataset from '../models/dataset.model.js'

const UploadFiles = async (projectID, files, uploadType) => {
  try {
    const { labels, validFiles } = parseAndValidateFiles(files, uploadType)
    const objKeyPrefix = `images/${projectID}`
    const uploadedFiles = await uploadFilesToGCS(validFiles, objKeyPrefix, uploadType)

    // const insertingLabels = labels.map((label) => ({ project_id: projectID, name: label }))
    // await LabelService.UpsertAll(projectID, insertingLabels)

    // // TODO: Refactor code
    // const datasetURL = `${config.storageBucketURL}/${objKeyPrefix}/*/*.jpg`
    // const dataset = new Dataset({ base_url: datasetURL, project_id: projectID })
    // await dataset.save()
    return uploadedFiles
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
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
const uploadFilesToGCS = async (files, prefix, uploadType) => {
  const timeNowUnix = new Date().getTime()
  const batchSize = 32
  const uploadedFiles = []
  for (let i = 0; i < files.length; i += batchSize) {
    const promises = files
      .slice(i, i + batchSize)
      .map((file) => uploadFile(file, prefix, uploadType))
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
  // const promises = files.map((file) => uploadFile(file, prefix, uploadType))
  // try {
  //   const results = await Promise.allSettled(promises)
  //   const doneTime = new Date().getTime()
  //   const timeDiff = (doneTime - timeNowUnix) / 1000
  //   console.log(`Successfully uploaded ${files.length} file(s), total time: ${timeDiff} seconds`)
  //   const uploadedFiles = results.map(result => result.value)
  //   return uploadedFiles
  // } catch (error) {
  //   console.error(error)
  //   throw new Error(error)
  // }
  // for (let i = 0; i < files.length; i++) {
  //   const bufferData = files[i].data
  //   const fileName = files[i].name
  //   const objKey = `${prefix}/${fileName}`
  //   try {
  //     await config.storageBucket.file(objKey).save(bufferData)
  //     console.log(`Successfully uploaded: ${fileName}`)
  //     successfulCount++
  //     uploadedImages.push({
  //       url: `${GCS_HOST}/${config.storageBucket}/${objKey}`
  //     })
  //   } catch (error) {
  //     errorCount++
  //     console.error(`Error uploading ${fileName}:`, error)
  //   }
  // }
}

const uploadFile = async (file, prefix, uploadType) => {
  const bufferData = file.data
  const fileName = file.name
  const objKey = `${prefix}/${fileName}`
  try {
    await config.storageBucket.file(objKey).save(bufferData)
    let label = ''
    if (uploadType == UploadTypes.FOLDER) {
      const paths = fileName.split('/')
      // TODO: ensure paths.length > 2
      label = paths[paths.length - 2]
    }
    return { url: `${GCS_HOST}/${config.storageBucketName}/${objKey}`, label }
  } catch (error) {
    console.error(error)
    Promise.reject(new Error(err))
  }
}

export { UploadFiles }
