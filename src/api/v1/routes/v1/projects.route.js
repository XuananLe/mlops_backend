import { Router } from 'express'
import ProjectController from '../../controllers/project.controller.js'

const projectRouter = Router()

projectRouter.get('/', ProjectController.List)
projectRouter.get('/:id', ProjectController.Get)
projectRouter.post('/', ProjectController.Create)
projectRouter.put('/:id', ProjectController.Update)
projectRouter.delete('/:id', ProjectController.Delete)
projectRouter.post('/:id/upload', ProjectController.UploadFiles)

export default projectRouter
