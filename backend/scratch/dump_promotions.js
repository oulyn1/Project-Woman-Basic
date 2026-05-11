import mongoose from 'mongoose';
import { env } from '~/config/environment.js';
import Promotion from '~/models/promotionModel.js';

async function dump() {
  await mongoose.connect(env.MONGODB_URI);
  const promotions = await Promotion.find({}).limit(5);
  console.log(JSON.stringify(promotions, null, 2));
  await mongoose.disconnect();
}

dump().catch(console.error);
