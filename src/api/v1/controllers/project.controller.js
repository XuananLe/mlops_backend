import ProjectService from '../services/project.service.js'
import DatasetService from '../services/dataset.service.js'

const List = async (req, res) => {
  const { _id } = req.user
  try {
    const projects = await ProjectService.List(_id)
    return res.json(projects)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const Get = async (req, res) => {
  const { id } = req.params
  try {
    const project = await ProjectService.Get(id)
    return res.json(project)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const Create = async (req, res) => {
  const { _id } = req.user
  try {
    const project = await ProjectService.Create(_id, req.body)
    return res.json(project)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const Update = async (req, res) => {
  const { _id } = req.user
  const { id } = req.params
  const { name } = req.body
  try {
    await ProjectService.Update(_id, id, { name })
    return res.sendStatus(200)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const Delete = async (req, res) => {
  const { _id } = req.user
  const { id } = req.params
  try {
    await ProjectService.Delete(_id, id)
    return res.sendStatus(200)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const UploadFiles = async (req, res) => {
  const { _id } = req.user
  const { id } = req.params
  const { type } = req.body
  try {
    const uploadedFiles = await ProjectService.UploadFiles(_id, id, req.files.files, type)
    return res.json(uploadedFiles)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}

const TrainModel = async (req, res) => {
  const { _id } = req.user
  const { id } = req.params

  try {
    const data = await DatasetService.CreateTFRecordDataset(id)
    res.json(data)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}

const ProjectController = {
  List,
  Get,
  Create,
  Update,
  Delete,
  UploadFiles,
  TrainModel,
}

export default ProjectController
