"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD
}

export const currencies: Record<string, Currency> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 1.0 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.12 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.52 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 149.50 },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.24 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(currencies.USD);

  // Load saved currency from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedCurrency");
      if (saved && currencies[saved]) {
        setCurrencyState(currencies[saved]);
      } else {
        // Auto-detect from browser locale
        const browserCurrency = detectCurrencyFromLocale();
        if (browserCurrency && currencies[browserCurrency]) {
          setCurrencyState(currencies[browserCurrency]);
        }
      }
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCurrency", newCurrency.code);
    }
  };

  const convertPrice = (priceInUSD: number): number => {
    return priceInUSD * currency.rate;
  };

  const formatPrice = (priceInUSD: number): string => {
    const convertedPrice = convertPrice(priceInUSD);

    // Format based on currency
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${currency.symbol}${formatter.format(convertedPrice)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

// Helper function to detect currency from browser locale
function detectCurrencyFromLocale(): string | null {
  if (typeof window === "undefined") return null;

  const locale = navigator.language || "en-US";

  // Map common locales to currencies
  const localeToCurrency: Record<string, string> = {
    "en-US": "USD",
    "en-GB": "GBP",
    "en-IN": "INR",
    "en-AU": "AUD",
    "en-CA": "CAD",
    "fr-FR": "EUR",
    "de-DE": "EUR",
    "es-ES": "EUR",
    "it-IT": "EUR",
    "ja-JP": "JPY",
    "zh-CN": "CNY",
    "ar-AE": "AED",
    "hi-IN": "INR",
  };

  return localeToCurrency[locale] || localeToCurrency[locale.split("-")[0]] || "USD";
}
