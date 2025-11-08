"use client";

import { useState } from "react";
import { useCurrency, currencies, Currency } from "../contexts/CurrencyContext";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currencyList = Object.values(currencies);

  return (
    <div className="currency-switcher" style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "0.5rem 1rem",
          border: "1px solid #ddd",
          borderRadius: "4px",
          background: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>{currency.symbol}</span>
        <span>{currency.code}</span>
        <span>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.25rem",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 1000,
            minWidth: "200px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {currencyList.map((curr) => (
            <button
              key={curr.code}
              onClick={() => {
                setCurrency(curr);
                setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                background: currency.code === curr.code ? "#f0f0f0" : "white",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>
                <strong>{curr.code}</strong> - {curr.name}
              </span>
              <span>{curr.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
