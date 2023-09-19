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
                                                                                                                                                             