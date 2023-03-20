import Label from '#api/models/label.model.js'

const List = async (projectID) => {
  try {
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
    // TODO: Handle case 404
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Create = async (projectID, fields) => {
  const label = new Label({ ...fields, project_id: projectID })
  try {
    await label.save()
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Update = async (labelID, fields) => {
  try {
    const label = await Label.findOneAndUpdate({ _id: labelID }, fields, { new: true })
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Delete = async (labelID) => {
  try {
    await Label.delete({ _id: labelID })
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
    const labels = await Label.find({ project_id: projectID })
    const labelMap = {}
    labels.forEach(label => {
      labelMap[label.name] = label._id
    });
    return labelMap
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const LabelService = { List, Get, Create, Update, Delete, UpsertAll, GetLabelMap }
export default LabelService
