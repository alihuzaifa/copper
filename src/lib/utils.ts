import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get software name from Redux settings with fallback
export function getSoftwareName(apiSettings: any, defaultName: string = 'Copper Wire Pro'): string {
  return apiSettings?.softwareName || defaultName;
}

// Utility function to get shop name from Redux settings with fallback
export function getShopName(apiSettings: any, defaultName: string = 'Shop Name'): string {
  return apiSettings?.shopName || defaultName;
}
