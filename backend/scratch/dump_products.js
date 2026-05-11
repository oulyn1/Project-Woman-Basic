import mongoose from 'mongoose';
import { env } from '~/config/environment.js';
import Product from '~/models/productModel.js';

async function dump() {
  await mongoose.connect(env.MONGODB_URI);
  const products = await Product.find({}).limit(3);
  console.log(JSON.stringify(products, null, 2));
  await mongoose.disconnect();
}

dump().catch(console.error);
