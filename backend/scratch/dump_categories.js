import mongoose from 'mongoose';
import { env } from '~/config/environment.js';
import Category from '~/models/categoryModel.js';

async function dump() {
  await mongoose.connect(env.MONGODB_URI);
  const categories = await Category.find({}).limit(5);
  console.log(JSON.stringify(categories, null, 2));
  await mongoose.disconnect();
}

dump().catch(console.error);
