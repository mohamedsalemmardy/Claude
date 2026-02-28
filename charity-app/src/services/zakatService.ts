import { ZakatInput, ZakatResult } from '../types';

// Gold Nisab: ~87.48 grams of gold
// Silver Nisab: ~612.36 grams of silver
// Using gold standard (more common in modern calculations)
const GOLD_PRICE_PER_GRAM_EGP = 3500; // Update periodically
const NISAB_GOLD_GRAMS = 87.48;
const ZAKAT_RATE = 0.025; // 2.5%

export const zakatService = {
  calculateNisab(): number {
    return NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM_EGP;
  },

  calculate(input: ZakatInput): ZakatResult {
    const nisab = this.calculateNisab();

    const totalAssets =
      input.cash +
      input.bankBalance +
      input.goldValue +
      input.silverValue +
      input.investments +
      input.businessInventory +
      input.debtsOwedToYou +
      input.propertyForTrade;

    const totalDeductions = input.debtsYouOwe;
    const totalWealth = totalAssets - totalDeductions;
    const isZakatDue = totalWealth >= nisab;
    const zakatAmount = isZakatDue ? totalWealth * ZAKAT_RATE : 0;

    const breakdown = [
      { label: 'cash', value: input.cash },
      { label: 'bankBalance', value: input.bankBalance },
      { label: 'goldValue', value: input.goldValue },
      { label: 'silverValue', value: input.silverValue },
      { label: 'investments', value: input.investments },
      { label: 'businessInventory', value: input.businessInventory },
      { label: 'debtsOwedToYou', value: input.debtsOwedToYou },
      { label: 'propertyForTrade', value: input.propertyForTrade },
      { label: 'debtsYouOwe', value: -input.debtsYouOwe },
    ].filter((item) => item.value !== 0);

    return {
      totalWealth,
      nisab,
      isZakatDue,
      zakatAmount,
      breakdown,
    };
  },

  getDefaultInput(): ZakatInput {
    return {
      cash: 0,
      bankBalance: 0,
      goldValue: 0,
      silverValue: 0,
      investments: 0,
      businessInventory: 0,
      debtsOwedToYou: 0,
      debtsYouOwe: 0,
      propertyForTrade: 0,
    };
  },
};
