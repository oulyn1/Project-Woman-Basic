import mongoose from 'mongoose';
import Promotion from '~/models/promotionModel';
import Product from '~/models/productModel';
import { computePromoStatus } from '~/utils/computePromoStatus';
import { isCustomerEligible } from '~/utils/checkPromotionEligibility';

const createPromotion = async (data) => {
  return await Promotion.create(data);
};

const getPromotions = async (query) => {
  const { search, type, computedStatus, conditionType, customerId, page = 1, limit = 20 } = query;
  
  const filter = {};
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (type) filter.type = type;
  if (conditionType) filter['condition.type'] = conditionType;
  
  // Note: computedStatus filtering is tricky because it's runtime.
  // We'll fetch all matching basic filters and then filter in memory for status 
  // or use complex date queries to match the status logic.
  
  if (computedStatus) {
    const now = new Date();
    if (computedStatus === 'inactive') {
      filter.status = 'inactive';
    } else if (computedStatus === 'scheduled') {
      filter.status = 'active';
      filter.startDate = { $gt: now };
    } else if (computedStatus === 'ended') {
      filter.status = 'active';
      filter.$or = [
        { isForever: false, endDate: { $lt: now } },
        { 
          maxUsageTotal: { $gt: 0 }, 
          $expr: { $gte: ["$usageCount", "$maxUsageTotal"] } 
        }
      ];
    } else if (computedStatus === 'active') {
      filter.status = 'active';
      filter.startDate = { $lte: now };
      filter.$and = [
        {
          $or: [
            { isForever: true },
            { endDate: { $gte: now } },
            { endDate: null }
          ]
        },
        {
          $or: [
            { maxUsageTotal: 0 },
            { $expr: { $lt: ["$usageCount", "$maxUsageTotal"] } }
          ]
        }
      ];
    }
  }

  const skip = (page - 1) * limit;
  const total = await Promotion.countDocuments(filter);
  let promotions = await Promotion.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Filter by customer eligibility if customerId is provided
  if (customerId) {
    const eligiblePromos = [];
    for (const promo of promotions) {
      const isEligible = await isCustomerEligible(promo, customerId);
      if (isEligible) {
        eligiblePromos.push(promo);
      }
    }
    promotions = eligiblePromos;
  }

  return {
    items: promotions.map(p => ({
      ...p.toObject(),
      computedStatus: computePromoStatus(p)
    })),
    meta: { total, page, limit }
  };
};

const getPromotionById = async (id) => {
  const promo = await Promotion.findById(id).populate('condition.specificCustomerIds', '_id name email');
  if (!promo) return null;
  return {
    ...promo.toObject(),
    computedStatus: computePromoStatus(promo)
  };
};

const updatePromotion = async (id, data) => {
  return await Promotion.findByIdAndUpdate(id, { $set: data }, { new: true });
};

const deletePromotion = async (id) => {
  return await Promotion.findByIdAndDelete(id);
};

const clonePromotion = async (id) => {
  const original = await Promotion.findById(id);
  if (!original) throw new Error('Promotion not found');

  const cloneData = original.toObject();
  delete cloneData._id;
  delete cloneData.createdAt;
  delete cloneData.updatedAt;
  delete cloneData.usageCount; // Reset usage counter

  cloneData.title = `[Bản sao] ${cloneData.title}`;
  cloneData.status = 'inactive';

  return await Promotion.create(cloneData);
};

const getEligibleOrderPromotions = async (customerId, orderValue) => {
  const now = new Date();
  const promos = await Promotion.find({
    type: 'order',
    status: 'active',
    startDate: { $lte: now },
    $or: [
      { isForever: true },
      { endDate: { $gte: now } },
      { endDate: null }
    ],
    minOrderValue: { $lte: orderValue }
  });

  const eligiblePromos = [];
  for (const promo of promos) {
    // Check usage limits
    if (promo.maxUsageTotal > 0 && promo.usageCount >= promo.maxUsageTotal) continue;
    
    const isEligible = await isCustomerEligible(promo, customerId);
    if (isEligible) {
      eligiblePromos.push({
        ...promo.toObject(),
        computedStatus: 'active'
      });
    }
  }

  return eligiblePromos;
};

const applyPromotions = async (cartItems, customerId, orderPromoId) => {
  let subtotal = 0;
  const processedItems = [];

  // 1. Process Product Promotions
  const now = new Date();
  const productPromos = await Promotion.find({
    type: 'product',
    status: 'active',
    startDate: { $lte: now },
    $or: [
      { isForever: true },
      { endDate: { $gte: now } },
      { endDate: null }
    ]
  });

  for (const item of cartItems) {
    let { productId, variantId, price, quantity } = item;
    
    // NORMALIZE IDS (handle if they are objects)
    productId = (productId?._id || productId)?.toString();
    variantId = (variantId?._id || variantId)?.toString();

    // ALWAYS FETCH BASE PRICE FROM DB TO AVOID DOUBLE DISCOUNTING
    const product = await Product.findById(productId);
    if (!product) {
      price = price || 0; // Fallback if DB fail (unlikely)
    } else {
      price = product.price;
    }

    let bestPromo = null;
    let maxDiscount = 0;

    // Filter promos that apply to this product and customer
    for (const promo of productPromos) {
      const appliesToProduct = promo.productIds.includes('ALL') || promo.productIds.includes(productId.toString());
      if (!appliesToProduct) continue;

      const isEligible = await isCustomerEligible(promo, customerId);
      if (!isEligible) continue;

      let discount = 0;
      if (promo.discountType === 'percent') {
        discount = price * (promo.discountValue / 100);
      } else {
        discount = promo.discountValue;
      }

      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestPromo = promo;
      }
    }

    const finalUnitPrice = Math.max(0, price - maxDiscount);
    subtotal += finalUnitPrice * quantity;

    processedItems.push({
      ...item,
      productId: productId.toString(),
      variantId: variantId ? variantId.toString() : null,
      price: price, // Ensure price is present here!
      originalUnitPrice: price,
      appliedPromo: bestPromo ? { _id: bestPromo._id, title: bestPromo.title, discountAmount: maxDiscount } : null,
      promotionApplied: !!bestPromo,
      finalUnitPrice
    });
  }



  // 2. Process Order Promotion
  let orderDiscount = 0;
  let appliedOrderPromo = null;

  if (orderPromoId) {
    let promo = null;
    if (mongoose.Types.ObjectId.isValid(orderPromoId)) {
      promo = await Promotion.findById(orderPromoId);
    } else {
      promo = await Promotion.findOne({ title: orderPromoId, type: 'order', status: 'active' });
    }

    if (promo && computePromoStatus(promo) === 'active') {
      const isEligible = await isCustomerEligible(promo, customerId);
      const meetsMinVal = subtotal >= promo.minOrderValue;

      if (isEligible && meetsMinVal) {
        if (promo.discountType === 'percent') {
          orderDiscount = subtotal * (promo.discountValue / 100);
        } else {
          orderDiscount = promo.discountValue;
        }
        appliedOrderPromo = promo;
      }
    }
  }

  let totalItemDiscount = 0;
  let originalSubtotal = 0;
  for (const item of processedItems) {
    originalSubtotal += item.price * item.quantity;
    if (item.appliedPromo) {
      totalItemDiscount += item.appliedPromo.discountAmount * item.quantity;
    }
  }

  const total = Math.max(0, subtotal - orderDiscount);

  return {
    items: processedItems,
    originalSubtotal,
    totalItemDiscount,
    discountedSubtotal: subtotal,
    appliedOrderPromo: appliedOrderPromo ? { _id: appliedOrderPromo._id, title: appliedOrderPromo.title } : null,
    orderDiscount,
    finalTotal: total
  };
};

// Increment usage count atomically
const incrementUsage = async (id) => {
  return await Promotion.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });
};

export const promotionService = {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  clonePromotion,
  getEligibleOrderPromotions,
  applyPromotions,
  incrementUsage
};
