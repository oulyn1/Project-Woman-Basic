import User from '~/models/userModel';
import Order from '~/models/orderModel';

export async function checkPromotionUsageLimit(promotion, customerId) {
  if (!customerId) return true;

  // 1. Total Usage Check
  if (promotion.maxUsageTotal > 0 && promotion.usageCount >= promotion.maxUsageTotal) {
    return false;
  }

  // 2. Per Customer Check
  if (promotion.maxUsagePerCustomer > 0) {
    const usedCount = await Order.countDocuments({
      userId: customerId,
      $or: [
        { appliedOrderPromoId: promotion._id },
        { 'items.appliedPromoId': promotion._id }
      ],
      status: { $ne: 'cancelled' } // Only count non-cancelled orders
    });

    if (usedCount >= promotion.maxUsagePerCustomer) {
      return false;
    }
  }

  return true;
}

export async function isCustomerEligible(promotion, customerId) {
  // Check usage limits first
  const usageOk = await checkPromotionUsageLimit(promotion, customerId);
  if (!usageOk) return false;

  if (!customerId) return promotion.condition.type === 'all';

  const customer = await User.findById(customerId);
  if (!customer) return promotion.condition.type === 'all';

  const cond = promotion.condition;
  if (cond.type === 'all') return true;

  if (cond.type === 'specific') {
    return cond.specificCustomerIds
      .map(id => id.toString())
      .includes(customer._id.toString());
  }

  if (cond.type === 'new') {
    const orderCount = await Order.countDocuments({ userId: customer._id });
    return orderCount < (cond.newCustomerMaxOrders || 1);
  }

  if (cond.type === 'loyal') {
    return cond.loyalTiers.includes(customer.loyaltyTier);
  }

  return false;
}
