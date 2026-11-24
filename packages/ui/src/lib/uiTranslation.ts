import { createContext, useContext } from "react";

type Translate = (
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
) => string;

function english(key: string, params?: Record<string, string | number>, fallback?: string) {
  const text = fallback ?? key;
  if (params == null) return text;
  return text.replace(/\{(\w+)\}/g, (token, key: string) =>
    Object.hasOwn(params, key) ? String(params[key]) : token,
  );
}

const UiTranslationContext = createContext<Translate | undefined>(undefined);

export const UiTranslationProvider = UiTranslationContext.Provider;

export function useUiTranslation() {
  return { t: useContext(UiTranslationContext) ?? english };
}
