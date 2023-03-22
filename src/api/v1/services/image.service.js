import Image from '#api/models/image.model.js'

const DeleteAll = async (images) => {
  const imageIDs = images.map((image) => image._id)
  try {
    await Image.deleteMany({ _id: { $in: imageIDs } })
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const DeleteByProject = async (projectID) => {
  try {
    await Image.deleteMany({ project_id: projectID })
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

const ImageService = { DeleteAll, DeleteByProject }
export default ImageService
