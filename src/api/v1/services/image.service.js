import config from '#src/config/config.js'
import Image from '#api/models/image.model.js'
import Project from '#api/models/project.model.js'
import Label from '#api/models/label.model.js'
import Dataset from '../models/dataset.model.js'
import { DatasetTypes, GCS_HOST } from '../data/constants.js'
import StorageService from './storage.service.js'

const List = async (projectID, page, size) => {
  try {
    const project = await Project.findOne({ _id: projectID })
    if (project == undefined) {
      throw new Error('Project does not exist')
    }

    const filter = { project_id: projectID, is_original: false }
    const offset = (page - 1) * size

    const total = await Image.find(filter).countDocuments()
    const totalPage = Math.ceil(total / size)

    const images = await Image.find(filter).populate('label_id').skip(offset).limit(size)
    const labelNames = new Set()
    const labels = []
    const files = images.map((image) => {
      let label = ''
      if (image.label_id) {
        label = image.label_id.name
        if (!labelNames.has(label)) {
          labelNames.add(label)
          labels.push({ id: image.label_id._id, value: image.label_id.name })
        }
      }

      return { ...image.toJSON(), label }
    })
    
    return {
      data: { files, labels },
      meta: {
        page,
        size,
        total_page: totalPage
      }
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

const UpdateAll = async (filter, images) => {
  const updatingImages = images.map((image) => {
    return {
      updateOne: {
        filter,
        update: image,
        upsert: true,
      },
    }
  })

  try {
    await Image.bulkWrite(updatingImages)
  } catch (error) {
    console.error(error)
    throw error
  }
}

const Delete = async (imageID) => {
  try {
    const image = await Image.findOne({ _id: imageID })
    if (image == undefined) {
      return
    }
    await Image.deleteMany({ uid: image.uid })
  } catch (error) {
    console.error(error)
    throw error
  }
}

const DeleteAll = async (images) => {
  const imageIDs = images.map((image) => image._id)
  try {
    await Image.deleteMany({ _id: { $in: imageIDs } })
  } catch (error) {
    console.error(error)
    throw error
  }
}

const DeleteByProject = async (projectID) => {
  try {
    await Image.deleteMany({ project_id: projectID })
  } catch (error) {
    console.error(error)
    throw error
  }
}

const LabelImage = async (imageID, labelID) => {
  try {
    const [image, label] = await Promise.all([
      Image.findOne({ _id: imageID }),
      Label.findOne({ _id: labelID }),
    ])
    if (image == undefined) {
      throw new Error('Image does not exist')
    }

    if (label == undefined) {
      throw new Error('Label does not exist')
    }

    const dataset = await Dataset.findOne({
      project_id: image.project_id,
      type: DatasetTypes.IMAGE_DIRECTORY,
    })

    const isLabelExist = !!image.label_id
    const newKey = ReplaceLabel(image.key, isLabelExist, label.name)
    await StorageService.MoveFile(image.key, newKey)

    const url = `${GCS_HOST}/${config.storageBucketName}/${newKey}`
    await image.updateOne({ label_id: labelID, dataset_id: dataset._id, key: newKey, url })
  } catch (error) {
    console.error(error)
    throw error
  }
}

// Pass undefined or '' for empty label
const ReplaceLabel = (key, isLabelExist, newLabel) => {
  const paths = key.split('/')
  // E.g: /project_id/daisy/name.png => label = daisy
  const oldLabelIdx = paths.length - 2
  if (isLabelExist) {
    paths[oldLabelIdx] = newLabel
  } else {
    paths.splice(oldLabelIdx + 1, 0, newLabel)
  }
  return paths.filter(Boolean).join('/')
}

const ImageService = {
  List,
  UpdateAll,
  Delete,
  DeleteAll,
  DeleteByProject,
  LabelImage,
  ReplaceLabel,
}
export default ImageService
