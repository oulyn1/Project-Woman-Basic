/**
 * Computed status (runtime):
 * - active: status='active' AND startDate <= now AND (isForever OR endDate >= now)
 * - scheduled: status='active' AND startDate > now
 * - ended: endDate < now (dù status='active')
 * - inactive: status='inactive'
 */
export function computePromoStatus(promo) {
  const now = new Date();
  if (promo.status === 'inactive') return 'inactive';
  
  const startDate = new Date(promo.startDate);
  if (startDate > now) return 'scheduled';
  
  if (!promo.isForever && promo.endDate) {
    const endDate = new Date(promo.endDate);
    if (endDate < now) return 'ended';
  }

  // New: Check total usage limit
  if (promo.maxUsageTotal > 0 && promo.usageCount >= promo.maxUsageTotal) {
    return 'ended';
  }
  
  return 'active';
}
