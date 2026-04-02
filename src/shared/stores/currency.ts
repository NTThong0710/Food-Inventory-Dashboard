import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Approximate exchange rate (you can make this dynamic later)
const USD_RATE = 25400; // 1 USD ~ 25,400 VND

export const useCurrencyStore = defineStore('currency', () => {
  const saved = localStorage.getItem('food_manager_currency');
  const currency = ref<'VND' | 'USD'>(saved === 'USD' ? 'USD' : 'VND');

  function toggleCurrency() {
    currency.value = currency.value === 'VND' ? 'USD' : 'VND';
    localStorage.setItem('food_manager_currency', currency.value);
  }

  // Format a VND amount according to the selected currency
  function format(vndAmount: number): string {
    if (currency.value === 'USD') {
      const usd = vndAmount / USD_RATE;
      return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${vndAmount.toLocaleString('vi-VN')} ₫`;
  }

  // Short format (for KPI cards, e.g. "1.2k ₫" or "$0.05")
  function formatShort(vndAmount: number): string {
    if (currency.value === 'USD') {
      const usd = vndAmount / USD_RATE;
      if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
      return `$${usd.toFixed(2)}`;
    }
    const k = vndAmount / 1000;
    return `${k.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}k ₫`;
  }

  const symbol = computed(() => currency.value === 'USD' ? '$' : '₫');

  return {
    currency,
    symbol,
    toggleCurrency,
    format,
    formatShort,
    USD_RATE
  };
});
