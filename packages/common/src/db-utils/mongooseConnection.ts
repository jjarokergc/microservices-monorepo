import mongoose, { ConnectOptions } from 'mongoose';
import { appLogger } from '../logging/logger';

export const connectToMongoose = async (
  connectionString: string,
  options: ConnectOptions = {}
): Promise<void> => {
  try {
    appLogger.debug(`Connecting to MongoDB...${connectionString}`);

    await mongoose.connect(connectionString, options);
    appLogger.info(`MongoDB: ${connectionString}`);
  } catch (error) {
    appLogger.error(`Error connecting to Mongoose: ${(error as Error).message}`);
    process.exit(1);
  }
};
