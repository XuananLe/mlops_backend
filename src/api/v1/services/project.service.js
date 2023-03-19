import Project from '#api/models/project.model.js'
import { ProjectCodePrefixes, PROJECT_CODE_LEN } from '../data/constants.js'
import { randomString } from '#api/utils/string.util.js'
import { UploadFiles as uploadFiles } from './storage.service.js'

const Create = async (req) => {
  const { _id } = req.user
  const { name, type } = req.body
  if (!ProjectType.hasOwnProperty(type)) {
    return res.status(400).json({ error: 'Project type invalid' })
  }

  const projectCode = generateProjectCode(type)
  const project = new Project({ name, type, code: projectCode, author: _id })
  try {
    await project.save()
    return project
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const UploadFiles = async (req) => {
  const { _id } = req.user
  const { id } = req.params
  const { type } = req.body

  const project = await Project.findOne({ _id: id }).populate('author')
  if (project == undefined) {
    throw new Error('Project not found')
  }
  // Shallow compare because project.author._id is ObjectId, _id is string
  if (project.author._id != _id) {
    throw new Error('Forbidden')
  }

  if (!req.files) {
    throw new Error('Files empty')
  }

  try {
    const uploadedFiles = await uploadFiles(project._id, req.files.files, type)
    return uploadedFiles
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const generateProjectCode = (projectType) => {
  const prefix = ProjectCodePrefixes[projectType]
  const code = randomString(PROJECT_CODE_LEN)
  return `${prefix}-${code}`
}

const ProjectService = {
  Create,
  UploadFiles,
}

export default ProjectService
