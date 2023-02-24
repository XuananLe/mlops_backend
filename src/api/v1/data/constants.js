const PROJECT_CODE_LEN = 10

const ALLOWED_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

const ProjectTypes = Object.freeze({
  CLASSIFICATION: 'CLASSIFICATION',
  OBJECT_DETECTION: 'OBJECT_DETECTION',
  SEGMENTATION: 'SEGMENTATION',
})

const ProjectCodePrefixes = Object.freeze({
  CLASSIFICATION: 'clf',
  OBJECT_DETECTION: 'obj',
  SEGMENTATION: 'seg',
})

const UploadTypes = Object.freeze({
  MULTIPLE: 0,
  FOLDER: 1,
})

export { PROJECT_CODE_LEN, ProjectTypes, ProjectCodePrefixes, UploadTypes, ALLOWED_FILE_EXTENSIONS }
