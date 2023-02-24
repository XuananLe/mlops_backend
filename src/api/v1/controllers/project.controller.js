import ProjectService from '../services/project.service.js'

const Create = async (req, res) => {
  try {
    const project = await ProjectService.Create(req)
    return res.json({ data: project })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const UploadFiles = async (req, res) => {
  try {
    await ProjectService.UploadFiles(req)
    return res.sendStatus(200)
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
