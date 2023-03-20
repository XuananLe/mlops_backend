import ProjectService from '../services/project.service.js'

const Create = async (req, res) => {
  const { _id } = req.user
  try {
    const project = await ProjectService.Create(_id, req.body)
    return res.json(project)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
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

const ProjectController = {
  Create,
  UploadFiles,
}

export default ProjectController
