import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import fileupload from 'express-fileupload'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import routes from '#api/routes/index.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

// middlewares
app.use(cors())
app.use(helmet())
app.use(bodyParser.json({ limit: '30mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }))
app.use(fileupload())

app.use(routes)

mongoose.set('strictQuery', true)
mongoose
  .connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to DB')
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error(err)
  })
