const aws = require("aws-sdk");
const S3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function uploadToS3WithHash(file, hashedFileName) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${hashedFileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    console.log(params);
    S3.upload(params, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data.Location);
      }
    });
  });
}

module.exports = {uploadToS3WithHash};