import ImageService from '../services/image.service.js'

const List = async (req, res) => {
  const { project_id } = req.query
  try {
    const images = await ImageService.List(project_id)
    return res.json(images)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const Delete = async (req, res) => {
  const { id } = req.params
  try {
    await ImageService.Delete(id)
    return res.sendStatus(200)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

const LabelImage = async (req, res) => {
  const { id } = req.params
  const { label_id } = req.body
  try {
    await ImageService.LabelImage(id, label_id)
    return res.sendStatus(200)
  } catch (error) {
    console.error(error)
    throw error
  }
}

const ImageController = { List, Delete, LabelImage }
export default ImageController
