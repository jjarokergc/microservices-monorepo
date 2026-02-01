import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from './logger';

export const connectToMongoose = async (
  connectionString: string,
  options: ConnectOptions = {}
): Promise<void> => {
  try {
    await mongoose.connect(connectionString, options);
    logger.info(`MongoDB: ${connectionString}`);
  } catch (error) {
    logger.error(`Error connecting to Mongoose: ${(error as Error).message}`);
    process.exit(1);
  }
};
