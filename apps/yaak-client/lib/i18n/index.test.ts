import { describe, expect, it } from "vitest";
import { jotaiStore } from "../jotai";
import { languageAtom, resolvedLanguageAtom, setLanguage, t, translatedModelType } from "./index";

describe("i18n", () => {
  it("translates common keys in English and Chinese", () => {
    setLanguage("en-US");
    expect(t("common.save")).toBe("Save");
    expect(t("common.cancel")).toBe("Cancel");
    expect(t("settings.interface.language")).toBe("Language");

    setLanguage("zh-CN");
    expect(t("common.save")).toBe("保存");
    expect(t("common.cancel")).toBe("取消");
    expect(t("settings.interface.language")).toBe("语言 / Language");
  });

  it("falls back to English when a key is missing in Chinese", () => {
    setLanguage("zh-CN");
    // Non-existent key with fallback
    expect(t("some.missing.key", undefined, "Fallback Text")).toBe("Fallback Text");
  });

  it("interpolates parameters correctly", () => {
    setLanguage("zh-CN");
    expect(t("dialogs.confirm_delete.confirm_prompt", { name: "my-request" })).toBe(
      "请输入 my-request 以确认删除",
    );

    setLanguage("en-US");
    expect(t("dialogs.confirm_delete.confirm_prompt", { name: "my-request" })).toBe(
      "Type my-request to confirm",
    );
  });

  it("translates model types correctly", () => {
    setLanguage("zh-CN");
    expect(translatedModelType("http_request")).toBe("HTTP 请求");
    expect(translatedModelType("folder")).toBe("文件夹");
    expect(translatedModelType("workspace")).toBe("工作区");

    setLanguage("en-US");
    expect(translatedModelType("http_request")).toBe("HTTP Request");
    expect(translatedModelType("folder")).toBe("Folder");
  });

  it("updates resolved language when setting language", () => {
    setLanguage("zh-CN");
    expect(jotaiStore.get(languageAtom)).toBe("zh-CN");
    expect(jotaiStore.get(resolvedLanguageAtom)).toBe("zh-CN");

    setLanguage("en-US");
    expect(jotaiStore.get(languageAtom)).toBe("en-US");
    expect(jotaiStore.get(resolvedLanguageAtom)).toBe("en-US");
  });
});
