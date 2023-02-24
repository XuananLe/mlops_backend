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

export { storageBucket }
