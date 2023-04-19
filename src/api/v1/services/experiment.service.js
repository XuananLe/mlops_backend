import Experiment from '#api/models/experiment.model.js'
import { ExperimentStatuses } from '../data/constants.js'
import ProjectService from './project.service.js'

const Create = async ({ experiment_name, project_id }) => {
  try {
    await ProjectService.Get(project_id)
    const experiment = new Experiment({ name: experiment_name, project_id })
    await experiment.save()
  } catch (error) {
    console.error(error)
    throw error
  }
}

const LatestByProject = async (projectID) => {
  try {
    const experiments = await Experiment.find({ project_id: projectID })
    if (!experiments || experiments.length == 0) {
      throw new Error('Project does not has any experiment')
    }
    return experiments[experiments.length - 1]
  } catch (error) {
    console.error(error)
    throw error
  }
}

const ExperimentService = { Create, LatestByProject }
export default ExperimentService
