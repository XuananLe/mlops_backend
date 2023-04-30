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

const Get = async (id) => {
  try {
    const experiment = await Experiment.findOne({ _id: id })
    if (!experiment) {
      throw new Error('Experiment does not exist')
    }
    return experiment
  } catch (error) {
    console.error(error)
    throw error
  }
}

const GetByName = async (name) => {
  try {
    const experiment = await Experiment.findOne({ name })
    if (!experiment) {
      throw new Error('Experiment does not exist')
    }
    return experiment
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

const ExperimentService = { Create, LatestByProject, Get, GetByName }
export default ExperimentService
