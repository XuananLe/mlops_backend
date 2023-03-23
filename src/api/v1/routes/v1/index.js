import { Router } from 'express'
import isAuth from '#api/middlewares/auth.middleware.js'
import authRouter from './auth.route.js'
import projectRouter from './projects.route.js'
import labelRouter from './labels.route.js'
import datasetRouter from './datasets.route.js'
import imageRouter from './images.route.js'

const routeV1 = Router()

routeV1.use('/auth', authRouter)
routeV1.use('/projects', [isAuth], projectRouter)
routeV1.use('/labels', labelRouter)
routeV1.use('/datasets', datasetRouter)
routeV1.use('/images', imageRouter)

export default routeV1
