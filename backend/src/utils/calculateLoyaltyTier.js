/**
 * Calculate loyalty tier based on total spending amount
 * Tiers:
 * - Standard: < 5,000,000 VND
 * - Silver: >= 5,000,000 VND
 * - Gold: >= 20,000,000 VND
 * - Platinum: >= 50,000,000 VND
 */
export function calculateLoyaltyTier(totalSpending) {
  if (!totalSpending || totalSpending < 0) return 'Standard';
  
  if (totalSpending >= 50_000_000) return 'Platinum';
  if (totalSpending >= 20_000_000) return 'Gold';
  if (totalSpending >= 5_000_000) return 'Silver';
  return 'Standard';
}
