import dotenv from 'dotenv'
import path from 'path'
import { Storage } from '@google-cloud/storage'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gcs = new Storage({
  keyFilename: path.join(__dirname, process.env.GCP_SERVICE_ACCOUNT),
  projectId: process.env.GCP_PROJECT_ID,
})

const storageBucket = gcs.bucket(process.env.GCP_BUCKET_NAME)
const storageBucketName = process.env.GCP_BUCKET_NAME
const storageBucketURL = `gs://${process.env.GCP_BUCKET_NAME}`
const port = process.env.PORT
const databaseURL = process.env.DATABASE_URL
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
const mlServiceAddr = process.env.ML_SERVICE_ADDR

const config = {
  port,
  databaseURL,
  storageBucket,
  storageBucketName,
  storageBucketURL,
  accessTokenSecret,
  refreshTokenSecret,
  mlServiceAddr,
}

export default config
