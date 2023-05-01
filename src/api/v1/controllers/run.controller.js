import RunService from '../services/run.service.js'

const Create = async (req, res) => {
  try {
    const run = await RunService.Create(req.body)
    return res.json(run)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const Get = async (req, res) => {
  const { run_id } = req.query
  try {
    const run = await RunService.Get(run_id)
    return res.json(run)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message })
  }
}

const GetBestExperimentRun = async (req, res) => {
  const { experiment_id } = req.query
  try {
    const bestRun = await RunService.GetBestExperimentRun(experiment_id)
    return res.json(bestRun)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const RunController = { Create, Get, GetBestExperimentRun }
export default RunController
