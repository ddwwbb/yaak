import { Suspense } from "react";
import { useUiTranslation } from "../../lib/uiTranslation";
import type { ButtonProps } from "../Button";
import { useEditorHost } from "../EditorHost";
import { ExternalLink } from "../ExternalLink";
import { Icon, type IconProps } from "../Icon";
import { IconButton } from "../IconButton";
import type { SelectProps } from "../Select";
import { HStack, VStack } from "../Stacks";
import { SettingRowSelect, SettingsList, SettingsSection } from "./SettingRow";
import { SettingsPage } from "./SettingsPage";
import type { SettingsCallbacks, SettingsView } from "./types";

const buttonColors: ButtonProps["color"][] = [
  "primary",
  "info",
  "success",
  "notice",
  "warning",
  "danger",
  "secondary",
  "default",
];

const icons: IconProps["icon"][] = [
  "info",
  "box",
  "update",
  "alert_triangle",
  "arrow_big_right_dash",
  "download",
  "copy",
  "magic_wand",
  "settings",
  "trash",
  "sparkles",
  "pencil",
  "paste",
  "search",
  "send_horizontal",
];

export interface SettingsThemeProps {
  view: SettingsView;
  callbacks: SettingsCallbacks;
}

export function SettingsTheme({ view, callbacks }: SettingsThemeProps) {
  const { Editor } = useEditorHost();
  const { t } = useUiTranslation();
  const { app, values, themes } = view;

  if (themes == null) {
    return null;
  }

  const lightThemes: SelectProps<string>["options"] = themes.themes
    .filter((theme) => !theme.dark)
    .map((theme) => ({
      label: theme.label,
      value: theme.id,
    }));

  const darkThemes: SelectProps<string>["options"] = themes.themes
    .filter((theme) => theme.dark)
    .map((theme) => ({
      label: theme.label,
      value: theme.id,
    }));

  const appParams = { appName: app.name };
  const title = t("settings.theme.title", undefined, "Theme");

  return (
    <SettingsPage
      title={title}
      description={
        <>
          {/* One text node, so the name kerns with the words around it */}
          {t(
            "settings.theme.header_desc",
            appParams,
            "Make {appName} your own by selecting a theme, or",
          )}{" "}
          <ExternalLink
            href="https://yaak.app/docs/plugin-development/plugins-quick-start"
            onOpen={callbacks.onOpenUrl}
          >
            {t("settings.theme.create_your_own", undefined, "Create Your Own")}
          </ExternalLink>
        </>
      }
    >
      <SettingsList className="space-y-8">
        <SettingsSection title={title}>
          <SettingRowSelect
            name="appearance"
            title={t("settings.theme.appearance", undefined, "Appearance")}
            description={t(
              "settings.theme.appearance_desc",
              appParams,
              "Choose whether {appName} follows your system appearance or uses a fixed mode.",
            )}
            value={values.appearance}
            onChange={(appearance) => callbacks.onChange({ appearance })}
            options={[
              { label: t("settings.theme.system", undefined, "Automatic"), value: "system" },
              { label: t("settings.theme.light", undefined, "Light"), value: "light" },
              { label: t("settings.theme.dark", undefined, "Dark"), value: "dark" },
            ]}
          />
          {(values.appearance === "system" || values.appearance === "light") && (
            <SettingRowSelect
              name="lightTheme"
              title={t("settings.theme.light_theme", undefined, "Light theme")}
              description={t(
                "settings.theme.light_theme_desc",
                appParams,
                "Theme used when {appName} is in light mode.",
              )}
              value={themes.light.id}
              options={lightThemes}
              onChange={(themeLight) => callbacks.onChange({ themeLight })}
            />
          )}
          {(values.appearance === "system" || values.appearance === "dark") && (
            <SettingRowSelect
              name="darkTheme"
              title={t("settings.theme.dark_theme", undefined, "Dark theme")}
              description={t(
                "settings.theme.dark_theme_desc",
                appParams,
                "Theme used when {appName} is in dark mode.",
              )}
              value={themes.dark.id}
              options={darkThemes}
              onChange={(themeDark) => callbacks.onChange({ themeDark })}
            />
          )}
        </SettingsSection>

        <SettingsSection title={t("settings.theme.preview_section", undefined, "Preview")}>
          <VStack
            space={3}
            className="mt-4 w-full bg-surface p-3 border border-dashed border-border-subtle rounded-sm overflow-x-auto"
          >
            <HStack className="text" space={1.5}>
              <Icon icon={themes.resolvedAppearance === "dark" ? "moon" : "sun"} />
              <strong>{themes.active.label}</strong>
              <em>{t("settings.theme.preview_label", undefined, "(preview)")}</em>
            </HStack>
            <HStack space={1.5} className="w-full">
              {buttonColors.map((c, i) => (
                <IconButton
                  key={c}
                  color={c}
                  size="2xs"
                  iconSize="xs"
                  icon={icons[i % icons.length] ?? "info"}
                  iconClassName="text"
                  title={`${c}`}
                />
              ))}
              {buttonColors.map((c, i) => (
                <IconButton
                  key={c}
                  color={c}
                  variant="border"
                  size="2xs"
                  iconSize="xs"
                  icon={icons[i % icons.length] ?? "info"}
                  iconClassName="text"
                  title={`${c}`}
                />
              ))}
            </HStack>
            <Suspense>
              <Editor
                defaultValue={[
                  "let foo = { // Demo code editor",
                  '  foo: ("bar" || "baz" ?? \'qux\'),',
                  "  baz: [1, 10.2, null, false, true],",
                  "};",
                ].join("\n")}
                heightMode="auto"
                language="javascript"
                stateKey={null}
              />
            </Suspense>
          </VStack>
        </SettingsSection>
      </SettingsList>
    </SettingsPage>
  );
}
