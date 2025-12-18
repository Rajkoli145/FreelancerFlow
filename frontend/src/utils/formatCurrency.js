/**
 * Currency symbols and formatting utilities
 */

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  CNY: '¥',
  HKD: 'HK$',
  NZD: 'NZ$',
  SEK: 'kr',
  KRW: '₩',
  SGD: 'S$',
  NOK: 'kr',
  MXN: '$',
  TRY: '₺',
  RUB: '₽',
  ZAR: 'R',
  BRL: 'R$',
  PLN: 'zł',
  THB: '฿',
  IDR: 'Rp',
  HUF: 'Ft',
  CZK: 'Kč',
  ILS: '₪',
  CLP: '$',
  PHP: '₱',
  AED: 'د.إ',
  SAR: 'ر.س',
  MYR: 'RM',
  RON: 'lei'
};

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'SEK', label: 'SEK - Swedish Krona' },
  { value: 'KRW', label: 'KRW - South Korean Won' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'NOK', label: 'NOK - Norwegian Krone' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'TRY', label: 'TRY - Turkish Lira' },
  { value: 'RUB', label: 'RUB - Russian Ruble' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'PLN', label: 'PLN - Polish Zloty' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'HUF', label: 'HUF - Hungarian Forint' },
  { value: 'CZK', label: 'CZK - Czech Koruna' },
  { value: 'ILS', label: 'ILS - Israeli Shekel' },
  { value: 'CLP', label: 'CLP - Chilean Peso' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'RON', label: 'RON - Romanian Leu' }
];

/**
 * Get currency symbol by currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD', 'INR')
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = 'USD') => {
  return CURRENCY_SYMBOLS[currencyCode] || '$';
};

/**
 * Format number as currency with proper symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code (e.g., 'USD', 'INR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount = 0, currencyCode = 'USD') => {
  const symbol = getCurrencySymbol(currencyCode);
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle invalid numbers
  if (isNaN(numAmount)) return `${symbol}0`;

  // Format with commas and 2 decimals max
  return `${symbol}${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format currency for display in inputs (without symbol)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted number string
 */
export const formatCurrencyInput = (amount = 0) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0';
  return numAmount.toLocaleString();
};
