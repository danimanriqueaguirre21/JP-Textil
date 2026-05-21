import type { Currency } from "@/types/commerce";

const LOCALES: Record<Currency, string> = {
  PEN: "es-PE",
  USD: "en-US",
};

/** Format an amount in minor units (cents/centavos) into a localized currency string. */
export function formatMoney(cents: number, currency: Currency = "PEN"): string {
  const locale = LOCALES[currency] ?? "es-PE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
