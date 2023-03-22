import Project from '#api/models/project.model.js'
import Image from '#api/models/image.model.js'
import { ProjectCodePrefixes, PROJECT_CODE_LEN, ProjectTypes } from '../data/constants.js'
import { randomString } from '#api/utils/string.util.js'
import StorageService from './storage.service.js'
import LabelService from './label.service.js'
import DatasetService from './dataset.service.js'
import ImageService from './image.service.js'

const List = async (userID) => {
  try {
    const projects = await Project.find({ author: userID })
    return projects
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Get = async (projectID) => {
  try {
    const project = await Project.findOne({ _id: projectID })
    if (project == undefined) {
      throw new Error('Project does not exist')
    }
    return project
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Create = async (userID, { name, type }) => {
  if (!ProjectTypes.hasOwnProperty(type)) {
    return res.status(400).json({ error: 'Project type invalid' })
  }

  const existingProject = await Project.findOne({ name })
  if (existingProject != undefined) {
    throw new Error('Project already exist')
  }

  const projectCode = generateProjectCode(type)
  const project = new Project({ name, type, code: projectCode, author: userID })
  try {
    await project.save()
    return project
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Update = async (userID, projectID, { name }) => {
  try {
    const project = await Project.findOne({ _id: projectID, author: userID })
    if (project == undefined) {
      throw new Error('Project does not exist')
    }

    const existingProject = await Project.findOne({ _id: projectID, author: userID, name })
    if (existingProject != undefined) {
      throw new Error('Project name is already taken')
    }
    await project.updateOne({ name })
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Delete = async (userID, projectID) => {
  try {
    const project = await Project.findOne({ _id: projectID, author: userID })
    if (project == undefined) {
      throw new Error('Project does not exist')
    }

    const images = await Image.find({ project_id: projectID })
    if (images && images.length > 0) {
      const imageKeys = images.map((image) => image.key)
      // TODO: Use transaction
      await StorageService.DeleteFiles(imageKeys)
      await ImageService.DeleteByProject(projectID)
      await LabelService.DeleteAllByProject(projectID)
      await DatasetService.DeleteAllByProject(projectID)
      await Project.deleteOne({ _id: projectID })
    }
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const UploadFiles = async (userID, projectID, files, uploadType) => {
  const project = await Project.findOne({ _id: projectID }).populate('author')
  if (project == undefined) {
    throw new Error('Project not found')
  }
  // Shallow compare because project.author._id is ObjectId, _id is string
  if (project.author._id != userID) {
    throw new Error('Forbidden')
  }

  if (!files) {
    throw new Error('Files can not be empty')
  }

  try {
    const uploadedFiles = await StorageService.UploadFiles(project._id, files, uploadType)
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

const ProjectService = { List, Get, Create, Update, Delete, UploadFiles }

export default ProjectService
