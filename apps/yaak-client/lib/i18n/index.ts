import { atom, useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { jotaiStore } from "../jotai";
import type { TranslationKeys } from "./locales/en";
import { en } from "./locales/en";
import { zhCN } from "./locales/zh-CN";

export type SupportedLanguage = "system" | "zh-CN" | "en-US";
export type ResolvedLanguage = "zh-CN" | "en-US";

const STORAGE_KEY = "yaak_locale";

const translations: Record<ResolvedLanguage, TranslationKeys> = {
  "en-US": en,
  "zh-CN": zhCN,
};

export function getSystemLanguage(): ResolvedLanguage {
  if (typeof navigator === "undefined" || !navigator.language) {
    return "en-US";
  }
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("zh")) {
    return "zh-CN";
  }
  return "en-US";
}

export function getInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved === "system" || saved === "zh-CN" || saved === "en-US") {
      return saved;
    }
  } catch {
    // localStorage might not be accessible
  }
  return "system";
}

export const languageAtom = atom<SupportedLanguage>(getInitialLanguage());

export const resolvedLanguageAtom = atom<ResolvedLanguage>((get) => {
  const lang = get(languageAtom);
  if (lang === "system") {
    return getSystemLanguage();
  }
  return lang;
});

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  let current: unknown = obj;
  let remaining = path;
  while (current != null && typeof current === "object") {
    // Action identifiers (such as sidebar.selected.delete) contain literal dots.
    if (Object.prototype.hasOwnProperty.call(current, remaining)) {
      return (current as Record<string, unknown>)[remaining];
    }
    const separator = remaining.indexOf(".");
    if (separator < 0) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[remaining.slice(0, separator)];
    remaining = remaining.slice(separator + 1);
  }
  return undefined;
}

export function t(
  path: string,
  params?: Record<string, string | number>,
  fallback?: string,
): string {
  const currentLang = jotaiStore.get(resolvedLanguageAtom);
  const dict = translations[currentLang] ?? translations["en-US"];
  const enDict = translations["en-US"];

  let value = getNestedValue(dict as unknown as Record<string, unknown>, path);
  if (typeof value !== "string") {
    value = getNestedValue(enDict as unknown as Record<string, unknown>, path);
  }

  if (typeof value !== "string") {
    return fallback ?? path;
  }

  if (!params) {
    return value;
  }

  let result = value;
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}|\\{${k}\\}`, "g"), String(v));
  }
  return result;
}

export function setLanguage(lang: SupportedLanguage) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore storage error
  }
  jotaiStore.set(languageAtom, lang);
}

export function useTranslation() {
  const [language, setLang] = useAtom(languageAtom);
  const resolvedLanguage = useAtomValue(resolvedLanguageAtom);

  const changeLanguage = useCallback(
    (newLang: SupportedLanguage) => {
      setLanguage(newLang);
      setLang(newLang);
    },
    [setLang],
  );

  const translate = useCallback(
    (path: string, params?: Record<string, string | number>, fallback?: string) => {
      const dict = translations[resolvedLanguage] ?? translations["en-US"];
      const enDict = translations["en-US"];

      let value = getNestedValue(dict as unknown as Record<string, unknown>, path);
      if (typeof value !== "string") {
        value = getNestedValue(enDict as unknown as Record<string, unknown>, path);
      }

      if (typeof value !== "string") {
        return fallback ?? path;
      }

      if (!params) {
        return value;
      }

      let result = value;
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}|\\{${k}\\}`, "g"), String(v));
      }
      return result;
    },
    [resolvedLanguage],
  );

  return {
    t: translate,
    language,
    resolvedLanguage,
    setLanguage: changeLanguage,
  };
}

export function translatedModelType(modelType: string): string {
  const normalized = modelType.toLowerCase();
  switch (normalized) {
    case "http_request":
    case "httprequest":
      return t("models.http_request");
    case "grpc_request":
    case "grpcrequest":
      return t("models.grpc_request");
    case "websocket_request":
    case "websocketrequest":
      return t("models.websocket_request");
    case "graphql_request":
    case "graphqlrequest":
      return t("models.graphql_request");
    case "folder":
      return t("models.folder");
    case "environment":
      return t("models.environment");
    case "workspace":
      return t("models.workspace");
    case "cookie_jar":
    case "cookiejar":
      return t("models.cookie_jar");
    case "plugin":
      return t("models.plugin");
    default:
      return modelType;
  }
}
