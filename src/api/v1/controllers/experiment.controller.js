import ExperimentService from '../services/experiment.service.js'
import ProjectService from '../services/project.service.js'

const Create = async (req, res) => {
  const { experiment_name, project_id } = req.body
  try {
    const experiment = await ExperimentService.Create({ experiment_name, project_id })
    const data = await ProjectService.TrainModel(project_id)
    console.log('Response when call API train model: ', data)
    return res.json(experiment)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const LatestByProject = async (req, res) => {
  const { project_id } = req.query
  try {
    const experiment = await ExperimentService.LatestByProject(project_id)
    return res.json({ data: experiment })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const ExperimentController = { Create, LatestByProject }
export default ExperimentController