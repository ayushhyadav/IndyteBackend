import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});
export default s3;

export const getSignedImage = async (Key) => {
  const getObjectParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: Key,
  };
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3, command);
  return url;
};
