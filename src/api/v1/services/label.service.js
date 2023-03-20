import Label from '#api/models/label.model.js'

const List = async (req) => {
  const { id } = req.params // project id
  try {
    const labels = await Label.find({ project_id: id })
    return labels
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Get = async (req) => {
  const { id } = req.params // label id
  try {
    const label = await Label.findOne({ _id: id })
    // TODO: Handle case 404
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Create = async (req) => {
  const { id } = req.params // project id
  const { name, description } = req.body
  const label = new Label({ name, description, project_id: id })
  try {
    await label.save()
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Update = async (req) => {
  const { id } = req.params
  const { name, description } = req.body
  try {
    const label = await Label.findOneAndUpdate({ _id: id }, { name, description }, { new: true })
    return label
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const Delete = async (req) => {
  const { id } = req.params
  try {
    await Label.delete({ _id: id })
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
