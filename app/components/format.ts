const USD_ACCOUNTING = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencySign: 'accounting', // This adds the parentheses
});

export function formatCurrencyUsd(value: number): string {
  return USD_ACCOUNTING.format(value);
}