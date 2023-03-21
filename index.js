import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import fileupload from 'express-fileupload'
import helmet from 'helmet'
import cors from 'cors'
import routes from '#api/routes/index.js'
import config from '#src/config/config.js'

const app = express()

// middlewares
app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(bodyParser.json({ limit: '30mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }))
app.use(fileupload())

app.use(routes)

mongoose.set('strictQuery', true)
mongoose
  .connect(config.databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to DB')
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`)
    })
  })
  .catch((err) => {
    console.error(err)
  })
