import { Router } from 'express'
import ProjectController from '../../controllers/project.controller.js'

const projectRouter = Router()

projectRouter.post('/', ProjectController.Create)
projectRouter.get('/:id', ProjectController.Get)
projectRouter.post('/:id/upload', ProjectController.UploadFiles)

export default projectRouter
