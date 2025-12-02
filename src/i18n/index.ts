/**
 * i18n (Internationalization) Module
 * Provides multi-language support for the application
 */

import { en } from './locales/en.js';
import { zhCHT } from './locales/zh-CHT.js';
import { zhCHS } from './locales/zh-CHS.js';

export type Locale = 'en' | 'zh-CHT' | 'zh-CHS';

export interface Messages {
  [key: string]: string | Messages;
}

const locales: Record<Locale, Messages> = {
  en,
  'zh-CHT': zhCHT,
  'zh-CHS': zhCHS,
};

let currentLocale: Locale = 'en';

/**
 * Set the current locale
 * @param locale The locale to set
 */
export function setLocale(locale: Locale): void {
  if (!locales[locale]) {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  currentLocale = locale;
}

/**
 * Get the current locale
 * @returns The current locale
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Get a translated message by key
 * @param key Message key (supports dot notation for nested keys)
 * @param params Optional parameters for string interpolation
 * @returns Translated message
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let message: string | Messages | undefined = locales[currentLocale];

  for (const k of keys) {
    if (typeof message === 'object' && message !== null) {
      message = message[k];
    } else {
      message = undefined;
      break;
    }
  }

  if (typeof message !== 'string') {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }

  // Simple parameter replacement
  if (params) {
    return message.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params[paramKey]?.toString() ?? `{${paramKey}}`;
    });
  }

  return message;
}

/**
 * Detect locale from environment or command line arguments
 * Priority: CLI flags > Environment variable > System locale > Default (en)
 */
export function detectLocale(cliLocale?: string): Locale {
  // CLI flag has highest priority
  if (cliLocale) {
    const normalized = cliLocale.toLowerCase();
    if (normalized === 'cht' || normalized === 'zh-cht') return 'zh-CHT';
    if (normalized === 'chs' || normalized === 'zh-chs') return 'zh-CHS';
    if (normalized === 'en') return 'en';
  }

  // Check environment variable
  const envLang = process.env.LANG || process.env.LANGUAGE || '';
  if (envLang.includes('zh_TW') || envLang.includes('zh-TW')) return 'zh-CHT';
  if (envLang.includes('zh_CN') || envLang.includes('zh-CN')) return 'zh-CHS';

  // Default to English
  return 'en';
}
