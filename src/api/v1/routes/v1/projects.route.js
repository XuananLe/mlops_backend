import { Router } from 'express'
import ProjectController from '../../controllers/project.controller.js'
import isAuth from '#api/middlewares/auth.middleware.js'

const projectRouter = Router()

projectRouter.post('/', [isAuth], ProjectController.Create)
projectRouter.post('/:id/upload', [isAuth], ProjectController.UploadFiles)

export default projectRouter
