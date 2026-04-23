import mongoose from 'mongoose';
import { env } from '~/config/environment';

export const CONNECT_MONGOOSE = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DATABASE_NAME,
    });
    console.log('Mongoose connected successfully to', env.DATABASE_NAME);
  } catch (error) {
    console.error('Mongoose connection error:', error);
    process.exit(1);
  }
};

export const CLOSE_MONGOOSE = async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed');
};
