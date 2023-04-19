import Dataset from '#api/models/dataset.model.js'
import { DatasetTypes } from '../data/constants.js'
import LabelService from '../services/label.service.js'
import { randomString } from '../utils/string.util.js'
import config from '#src/config/config.js'
import axios from 'axios'

const Upsert = async (dataset) => {
  const upsertDataset = [
    {
      updateOne: {
        filter: { project_id: dataset.project_id, key: dataset.key },
        update: dataset,
        upsert: true,
      },
    },
  ]

  try {
    await Dataset.bulkWrite(upsertDataset)
    const result = await Dataset.findOne({ project_id: dataset.project_id, key: dataset.key })
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}

const ListByProject = async (projectID) => {
  try {
    const dataset = await Dataset.findOne({
      project_id: projectID,
      type: DatasetTypes.IMAGE_DIRECTORY,
    })
    return dataset
  } catch (error) {
    console.error(error)
    throw error
  }
}

const DeleteAllByProject = async (projectID) => {
  try {
    await Dataset.deleteMany({ project_id: projectID })
  } catch (error) {
    console.error(error)
    throw error
  }
}

const CreateTFRecordDataset = async (projectID) => {
  try {
    const dataset = await DatasetService.ListByProject(projectID)
    const labelMap = await LabelService.GetLabelMap(projectID)
    const classes = Object.keys(labelMap)
    const experimentName = randomString(10)

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

    const { data } = await axios.post(`${config.mlServiceAddr}/clf/dataset`, payload)
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

const DatasetService = { Upsert, DeleteAllByProject, ListByProject, CreateTFRecordDataset }
export default DatasetService
