import Label from '#api/models/label.model.js'
import ProjectService from './project.service.js'

const List = async (projectID) => {
  try {
    await ProjectService.Get(projectID)
    const labels = await Label.find({ project_id: projectID })
    return labels
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Get = async (labelID) => {
  try {
    const label = await Label.findOne({ _id: labelID })
    if (label == undefined) {
      throw new Error('Label does not exist')
    }
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Create = async ({ name, description, project_id }) => {
  try {
    await ProjectService.Get(project_id)
    const existingLabel = await Label.findOne({ project_id, name })
    if (existingLabel != undefined) {
      throw new Error('Label already exist')
    }

    const label = new Label({ name, description, project_id })
    await label.save()
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Update = async (id, { name, description, project_id }) => {
  try {
    await ProjectService.Get(project_id)
    const label = await Label.findOne({ _id: id })
    if (label == undefined || label.project_id != project_id) {
      throw new Error('Label does not exist')
    }

    const existingLabel = await Label.findOne({ project_id, name })
    if (existingLabel != undefined) {
      throw new Error('Label already exist')
    }

    await label.updateOne({ name, description, project_id })
    // Old value
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Delete = async (labelID) => {
  try {
    await Label.deleteOne({ _id: labelID })
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const UpsertAll = async (projectID, labels) => {
  const upsertingLabels = labels.map((label) => {
    return {
      updateOne: {
        filter: { project_id: projectID, name: label.name },
        update: label,
        upsert: true,
      },
    }
  })

  try {
    await Label.bulkWrite(upsertingLabels)
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const GetLabelMap = async (projectID) => {
  try {
    await ProjectService.Get(projectID)
    const labels = await Label.find({ project_id: projectID })
    const labelMap = {}
    labels.forEach((label) => {
      labelMap[label.name] = label._id
    })
    return labelMap
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const LabelService = { List, Get, Create, Update, Delete, UpsertAll, GetLabelMap }
export default LabelService
