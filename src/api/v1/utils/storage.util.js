import { storageBucket } from '#src/config/gcp.config.js'

function uploadFilesToGCS(req, res, next) {
  console.log('Uploading...')
  if (!req.files) {
    return res.sendStatus(400)
  }

  let files = req.files.files

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const bufferData = file.data
    const objKey = Buffer.from(file.name, 'base64').toString('ascii')
    uploadFile(bufferData, objKey)
      .then()
      .catch((err) => console.log(err))
    // const gcsname = Date.now() + f[0].originalname
    // const file = bucket.file(gcsname)
    // const stream = file.createWriteStream({
    //   metadata: {
    //     contentType: f[0].mimetype,
    //   },
    //   resumable: false,
    // })
    // stream.on('error', (err) => {
    //   f[0].cloudStorageError = err
    //   next(err)
    // })
    // stream.end(f[0].buffer)
    // promises.push(
    //   new Promise((resolve, reject) => {
    //     stream.on('finish', () => {
    //       f[0].cloudStorageObject = gcsname
    //       file.makePublic().then(() => {
    //         f[0].cloudStoragePublicUrl = getPublicUrl(gcsname)
    //         resolve()
    //       })
    //     })
    //   })
    // )
  }
  return res.json({ msg: 'Done' })
}

const formatFilePath = (projectCode, localPath, basePath) => {
  return `images/${projectCode}/${localPath}`
}

const uploadFile = async (bufferData, objKey) => {
  // objKey = formatFilePath('abc', objKey, '')
  // await storageBucket.file(objKey).save(bufferData)
  console.log(`Uploading file ${objKey}...`)
}

export { uploadFilesToGCS }
