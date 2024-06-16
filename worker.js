import Bull from 'bull';
import { ObjectId } from 'mongodb';
import sharp from 'sharp';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');

const generateThumbnail = async (path, width) => {
  const thumbnailPath = `${path}_${width}`;
  await sharp(path)
    .resize({ width, height: width })
    .toFile(thumbnailPath);
};

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({
    _id: ObjectId(fileId),
    userId: ObjectId(userId),
  });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];
  const thumbnailPromises = sizes.map((size) => generateThumbnail(file.localPath, size));

  await Promise.all(thumbnailPromises);
});
