"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

type Locale = "en" | "es" | "fr" | "hi" | "ar";

interface Language {
  code: Locale;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Get current locale from pathname
  const currentLocale = pathname.split("/")[1] as Locale || "en";
  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const switchLanguage = (locale: Locale) => {
    startTransition(() => {
      // Remove current locale from pathname and add new one
      const newPathname = pathname.replace(/^\/[a-z]{2}/, `/${locale}`);
      router.push(newPathname || `/${locale}`);
      setIsOpen(false);
    });
  };

  return (
    <div className="language-switcher" style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
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
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.code.toUpperCase()}</span>
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
            minWidth: "150px",
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              disabled={isPending}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                background: currentLocale === lang.code ? "#f0f0f0" : "white",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
