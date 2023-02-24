import { Router } from 'express'
import authRouter from './auth.route.js'
import projectRouter from './projects.route.js'

const routeV1 = Router()

routeV1.use('/auth', authRouter)
routeV1.use('/projects', projectRouter)

export default routeV1
