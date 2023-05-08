import axios from 'axios'
import config from '#src/config/config.js'
import Project from '#api/models/project.model.js'
import Image from '#api/models/image.model.js'
import Experiment from '#api/models/experiment.model.js'
import { ProjectCodePrefixes, PROJECT_CODE_LEN, ProjectTypes } from '../data/constants.js'
import { randomString } from '#api/utils/string.util.js'
import StorageService from './storage.service.js'
import LabelService from './label.service.js'
import DatasetService from './dataset.service.js'
import ImageService from './image.service.js'
import ExperimentService from './experiment.service.js'
import MLModel from '../models/mlmodel.model.js'

const List = async (userID) => {
  try {
    const projects = await Project.find({ author: userID }).sort('-createdAt')
    return projects
  } catch (error) {
    console.error(error)
    throw error
  }
}

const Get = async (projectID) => {
  try {
    const project = await Project.findOne({ _id: projectID })
    if (!project) {
      throw new Error('Project does not exist')
    }
    return project
  } catch (error) {
    console.error(error)
    throw error
  }
}

const Create = async (userID, { name, description, expectation_accuracy, type }) => {
  if (!ProjectTypes.hasOwnProperty(type)) {
    return res.status(400).json({ error: 'Project type invalid' })
  }

  try {
    const existingProject = await Project.findOne({ name })
    if (existingProject != undefined) {
      throw new Error('Project already exist')
    }

    const projectCode = generateProjectCode(type)
    const project = new Project({
      name,
      description,
      expectation_accuracy,
      type,
      code: projectCode,
      author: userID,
    })

    await project.save()
    return project
  } catch (error) {
    console.error(error)
    throw error
  }
}

const Update = async (projectID, updateInfo) => {
  try {
    const project = await Project.findOne({ _id: projectID })
    if (project == undefined) {
      throw new Error('Project does not exist')
    }

    if (updateInfo.name) {
      const existingProject = await Project.findOne({ _id: projectID, name })
      if (existingProject != undefined) {
        throw new Error('Project name is already taken')
      }
    }
    await project.updateOne(updateInfo)
  } catch (error) {
    console.error(error)
    throw error
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
    throw error
  }
}

const UploadFiles = async (userID, projectID, files, uploadType) => {
  try {
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

    const uploadedFiles = await StorageService.UploadFiles(project._id, files, uploadType)
    return uploadedFiles
  } catch (error) {
    console.error(error)
    throw error
  }
}

const TrainModel = async (projectID) => {
  try {
    const dataset = await DatasetService.ListByProject(projectID)
    const labelMap = await LabelService.GetLabelMap(projectID)
    const classes = Object.keys(labelMap)
    const experiment = await ExperimentService.LatestByProject(projectID)
    const experimentName = experiment.name

    const payload = {
      project_id: projectID,
      experiment_name: experimentName,
      gcs_folder: dataset.pattern,
      gcs_output: `gs://${config.storageBucketName}/datasets/${experimentName}/`,
      dataset_url: `gs://${config.storageBucketName}/datasets/${experimentName}/*.tfrec`,
      target_size: 224,
      classes,
      num_classes: classes.length,
    }

    const { data } = await axios.post(`${config.mlServiceAddr}/clf/train`, payload)
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

const ListModel = async (userID) => {
  try {
    const models = await MLModel.find({ author_id: userID }).sort('-createdAt')
    return models
  } catch (error) {
    console.error(error)
    throw error
  }
}

const generateProjectCode = (projectType) => {
  const prefix = ProjectCodePrefixes[projectType]
  const code = randomString(PROJECT_CODE_LEN)
  return `${prefix}-${code}`
}

const ProjectService = { List, Get, Create, Update, Delete, UploadFiles, TrainModel, ListModel }

export default ProjectService
