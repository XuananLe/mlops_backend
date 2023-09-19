const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

async function listBuckets() {
  try {
    const [buckets] = await storage.getBuckets();

    console.log('Buckets:');
    buckets.forEach((bucket) => {
      console.log(bucket.name);
    });
  } catch (err) {
    console.error('Error listing buckets:', err);
  }
}

listBuckets();

// list all object in bucket
async function listFiles() {
  try {
    const [files] = await storage.bucket("nas-rd320-model").getFiles();

    console.log('Files:');
    files.forEach((file) => {
      console.log(file.name);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}
listFiles();


async function uploadFile(filename = "test.txt", bucketName = "nas-rd320-model") {
  try {
    await storage.bucket("nas-rd320-model").upload("./test.txt", {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      // By setting the option `destination`, you can change the name of the
      // object you are uploading to a bucket.
      metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        cacheControl: 'public, max-age=31536000',
      },
    });

    console.log(`${filename} uploaded to ${bucketName}.`);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
uploadFile();

