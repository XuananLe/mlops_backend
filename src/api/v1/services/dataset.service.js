import Dataset from '#api/models/dataset.model.js'

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
    throw new Error(error)
  }
}

const DeleteAllByProject = async (projectID) => {
  try {
    await Dataset.deleteMany({ project_id: projectID })
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const DatasetService = { Upsert, DeleteAllByProject }
export default DatasetService
