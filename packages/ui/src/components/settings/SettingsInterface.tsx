import type { ReactNode } from "react";
import { useState } from "react";
import { clamp } from "../../lib/clamp";
import { useUiTranslation } from "../../lib/uiTranslation";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import {
  SettingRow,
  SettingRowBoolean,
  SettingRowSelect,
  SettingSelectControl,
  SettingsList,
  SettingsSection,
} from "./SettingRow";
import { SettingsPage } from "./SettingsPage";
import type {
  SettingsCallbacks,
  SettingsEditorKeymap,
  SettingsInterfaceRow,
  SettingsView,
} from "./types";

const NULL_FONT_VALUE = "__NULL_FONT__";

const fontSizeOptions = [
  8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
].map((n) => ({ label: `${n}`, value: `${n}` }));

export interface SettingsInterfaceProps {
  view: SettingsView;
  callbacks: SettingsCallbacks;
  /** Sections only this app has, shown first, like the client's Workspaces */
  leadingSections?: ReactNode;
  /** Sections only this app has, shown last, like the client's License */
  trailingSections?: ReactNode;
}

export function SettingsInterface({
  view,
  callbacks,
  leadingSections,
  trailingSections,
}: SettingsInterfaceProps) {
  const { t } = useUiTranslation();
  const { app, values, fonts } = view;
  const shown = (row: SettingsInterfaceRow) => !view.hiddenInterfaceRows?.includes(row);
  const interfaceFontLabel = t("settings.interface.interface_font", undefined, "Interface font");
  const editorFontLabel = t("settings.interface.editor_font", undefined, "Editor font");
  const defaultFontLabel = t("settings.interface.system_default", undefined, "System default");

  return (
    <SettingsPage
      title={t("settings.interface.title", undefined, "Interface")}
      description={t(
        "settings.interface.description",
        undefined,
        "Tweak settings related to the user interface.",
      )}
    >
      <SettingsList className="space-y-8">
        {leadingSections}

        <SettingsSection title={t("settings.interface.fonts_section", undefined, "Fonts")}>
          <SettingRow
            title={interfaceFontLabel}
            description={t(
              "settings.interface.interface_font_desc",
              { appName: app.name },
              "Font used for {appName} interface controls.",
            )}
            controlClassName="gap-1"
          >
            {fonts && (
              <SettingSelectControl
                name="uiFont"
                label={interfaceFontLabel}
                selectClassName="w-72!"
                value={values.interfaceFont ?? NULL_FONT_VALUE}
                defaultValue={NULL_FONT_VALUE}
                options={[
                  { label: defaultFontLabel, value: NULL_FONT_VALUE },
                  ...fonts.uiFonts.map((f) => ({ label: f, value: f })),
                  ...fonts.editorFonts.map((f) => ({ label: f, value: f })),
                ]}
                onChange={(v) =>
                  callbacks.onChange({ interfaceFont: v === NULL_FONT_VALUE ? null : v })
                }
              />
            )}
            <SettingSelectControl
              name="interfaceFontSize"
              label={t("settings.interface.interface_font_size", undefined, "Interface Font Size")}
              selectClassName="w-20!"
              value={`${values.interfaceFontSize}`}
              defaultValue="14"
              options={fontSizeOptions}
              onChange={(v) => callbacks.onChange({ interfaceFontSize: Number.parseInt(v, 10) })}
            />
          </SettingRow>

          <SettingRow
            title={editorFontLabel}
            description={t(
              "settings.interface.editor_font_desc",
              undefined,
              "Font used in request and response editors.",
            )}
            controlClassName="gap-1"
          >
            {fonts && (
              <SettingSelectControl
                name="editorFont"
                label={editorFontLabel}
                selectClassName="w-72!"
                value={values.editorFont ?? NULL_FONT_VALUE}
                defaultValue={NULL_FONT_VALUE}
                options={[
                  { label: defaultFontLabel, value: NULL_FONT_VALUE },
                  ...fonts.editorFonts.map((f) => ({ label: f, value: f })),
                ]}
                onChange={(v) =>
                  callbacks.onChange({ editorFont: v === NULL_FONT_VALUE ? null : v })
                }
              />
            )}
            <SettingSelectControl
              name="editorFontSize"
              label={t("settings.interface.editor_font_size", undefined, "Editor Font Size")}
              selectClassName="w-20!"
              value={`${values.editorFontSize}`}
              defaultValue="12"
              options={fontSizeOptions}
              onChange={(v) =>
                callbacks.onChange({
                  editorFontSize: clamp(Number.parseInt(v, 10) || 14, 8, 30),
                })
              }
            />
          </SettingRow>
        </SettingsSection>

        {(shown("editorKeymap") || shown("editorSoftWrap") || shown("coloredMethods")) && (
          <SettingsSection title={t("settings.interface.editor_section", undefined, "Editor")}>
            {shown("editorKeymap") && (
              <SettingRowSelect<SettingsEditorKeymap>
                name="editorKeymap"
                title={t("settings.interface.editor_keymap", undefined, "Editor keymap")}
                description={t(
                  "settings.interface.editor_keymap_desc",
                  undefined,
                  "Keyboard shortcut preset used by text editors.",
                )}
                value={values.editorKeymap}
                onChange={(editorKeymap) => callbacks.onChange({ editorKeymap })}
                options={[
                  {
                    label: t("settings.interface.keymap_default", undefined, "Default"),
                    value: "default",
                  },
                  { label: "Vim", value: "vim" },
                  { label: "VSCode", value: "vscode" },
                  { label: "Emacs", value: "emacs" },
                ]}
              />
            )}
            {shown("editorSoftWrap") && (
              <SettingRowBoolean
                title={t("settings.interface.editor_soft_wrap", undefined, "Wrap editor lines")}
                description={t(
                  "settings.interface.editor_soft_wrap_desc",
                  undefined,
                  "Wrap long lines in request and response editors.",
                )}
                checked={values.editorSoftWrap}
                onChange={(editorSoftWrap) => callbacks.onChange({ editorSoftWrap })}
              />
            )}
            {shown("coloredMethods") && (
              <SettingRowBoolean
                title={t(
                  "settings.interface.colored_methods",
                  undefined,
                  "Colorize request methods",
                )}
                description={t(
                  "settings.interface.colored_methods_desc",
                  undefined,
                  "Use method-specific colors for HTTP request methods.",
                )}
                checked={values.coloredMethods}
                onChange={(coloredMethods) => callbacks.onChange({ coloredMethods })}
              />
            )}
          </SettingsSection>
        )}

        {(shown("nativeTitlebar") || view.windowControlsSetting) && (
          <SettingsSection title={t("settings.interface.window_section", undefined, "Window")}>
            {shown("nativeTitlebar") && (
              <NativeTitlebarSetting
                useNativeTitlebar={values.useNativeTitlebar}
                onApply={callbacks.onApplyNativeTitlebar}
              />
            )}
            {view.windowControlsSetting && (
              <SettingRowBoolean
                title={t(
                  "settings.interface.hide_window_controls",
                  undefined,
                  "Hide window controls",
                )}
                description={t(
                  "settings.interface.hide_window_controls_desc",
                  undefined,
                  "Hide the close, maximize, and minimize controls on Windows or Linux.",
                )}
                checked={values.hideWindowControls}
                onChange={(hideWindowControls) => callbacks.onChange({ hideWindowControls })}
              />
            )}
          </SettingsSection>
        )}

        {trailingSections}
      </SettingsList>
    </SettingsPage>
  );
}

function NativeTitlebarSetting({
  useNativeTitlebar,
  onApply,
}: {
  useNativeTitlebar: boolean;
  onApply: SettingsCallbacks["onApplyNativeTitlebar"];
}) {
  const { t } = useUiTranslation();
  const [nativeTitlebar, setNativeTitlebar] = useState(useNativeTitlebar);
  const title = t("settings.interface.native_titlebar", undefined, "Native title bar");

  return (
    <SettingRow
      title={title}
      description={t(
        "settings.interface.native_titlebar_desc",
        undefined,
        "Use the operating system's standard title bar and window controls.",
      )}
      controlClassName="gap-2"
    >
      <Checkbox
        hideLabel
        size="md"
        checked={nativeTitlebar}
        title={title}
        onChange={setNativeTitlebar}
      />
      {useNativeTitlebar !== nativeTitlebar && (
        <Button color="primary" size="xs" onClick={() => onApply(nativeTitlebar)}>
          {t("settings.interface.apply_restart", undefined, "Apply and Restart")}
        </Button>
      )}
    </SettingRow>
  );
}
