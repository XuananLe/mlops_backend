import { storageBucket } from '#src/config/gcp.config.js'
import { UploadTypes, ALLOWED_FILE_EXTENSIONS } from '../data/constants.js'
import { removeParentDir } from '../utils/string.util.js'

const UploadFiles = async (projectCode, files, uploadType) => {
  try {
    const validFiles = parseAndValidateFiles(files, uploadType)
    const objKeyPrefix = `images/${projectCode}`
    await uploadFilesToGCS(validFiles, objKeyPrefix)
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const parseAndValidateFiles = (files, uploadType) => {
  const validFiles = []
  for (let i = 0; i < files.length; i++) {
    if (uploadType == UploadTypes.FOLDER) {
      // Decode base64
      const originalFileName = Buffer.from(files[i].name, 'base64').toString('ascii')
      files[i].name = removeParentDir(originalFileName)
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
  return validFiles
}

const isAllowedExtension = (fileName) => {
  const idx = fileName.lastIndexOf('.')
  if (idx <= 0) {
    return false
  }
  const ext = fileName.substring(idx + 1, fileName.length)
  return ALLOWED_FILE_EXTENSIONS.includes(ext)
}

// TODO: using socket to realtime rendering
const uploadFilesToGCS = async (files, prefix) => {
  for (let i = 0; i < files.length; i++) {
    const bufferData = files[i].data
    const fileName = files[i].name
    const objKey = `${prefix}/${fileName}`
    try {
        await storageBucket.file(objKey).save(bufferData)
        console.log(`Successfully uploaded: ${fileName}`)
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error)
    }
  }
}

export { UploadFiles }
