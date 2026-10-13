import { useTranslation, type SupportedLanguage } from "../../lib/i18n";
import { platform } from "@yaakapp-internal/platform";
import { useFonts } from "@yaakapp-internal/fonts";
import { useLicense } from "@yaakapp-internal/license";
import type { EditorKeymap, Settings } from "@yaakapp-internal/models";
import { patchModel, settingsAtom } from "@yaakapp-internal/models";
import { clamp, Heading, VStack } from "@yaakapp-internal/ui";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { activeWorkspaceAtom } from "../../hooks/useActiveWorkspace";
import { showConfirm } from "../../lib/confirm";
import { pricingUrl } from "../../lib/pricingUrl";
import { rpc } from "../../lib/rpc";
import { CargoFeature } from "../CargoFeature";
import { Button } from "../core/Button";
import { Checkbox } from "../core/Checkbox";
import { Link } from "../core/Link";
import {
  ModelSettingRowBoolean,
  ModelSettingRowSelect,
  SettingRow,
  SettingRowBoolean,
  SettingRowSelect,
  SettingSelectControl,
  SettingsList,
  SettingsSection,
} from "../core/SettingRow";

const NULL_FONT_VALUE = "__NULL_FONT__";

const fontSizeOptions = [
  8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
].map((n) => ({ label: `${n}`, value: `${n}` }));

const keymaps: { value: EditorKeymap; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "vim", label: "Vim" },
  { value: "vscode", label: "VSCode" },
  { value: "emacs", label: "Emacs" },
];

export function SettingsInterface() {
  const workspace = useAtomValue(activeWorkspaceAtom);
  const settings = useAtomValue(settingsAtom);
  const fonts = useFonts();
  const { t, language, setLanguage } = useTranslation();
  if (settings == null || workspace == null) {
    return null;
  }

  return (
    <VStack space={1.5} className="mb-4">
      <div className="mb-3">
        <Heading>{t("settings.interface.title")}</Heading>
        <p className="text-text-subtle">{t("settings.interface.description")}</p>
      </div>
      <SettingsList className="space-y-8">
        <SettingsSection title={t("settings.interface.language")}>
          <SettingRowSelect
            title={t("settings.interface.language")}
            description={t("settings.interface.language_desc")}
            name="interfaceLanguage"
            value={language}
            onChange={(v) => setLanguage(v as SupportedLanguage)}
            options={[
              { label: t("settings.interface.language_system"), value: "system" },
              { label: t("settings.interface.language_zh"), value: "zh-CN" },
              { label: t("settings.interface.language_en"), value: "en-US" },
            ]}
          />
        </SettingsSection>

        <SettingsSection title={t("settings.interface.workspaces_section")}>
          <SettingRowSelect
            title={t("settings.interface.open_workspace_behavior")}
            description={t("settings.interface.open_workspace_behavior_desc")}
            name="switchWorkspaceBehavior"
            value={
              settings.openWorkspaceNewWindow === true
                ? "new"
                : settings.openWorkspaceNewWindow === false
                  ? "current"
                  : "ask"
            }
            onChange={async (v) => {
              if (v === "current") await patchModel(settings, { openWorkspaceNewWindow: false });
              else if (v === "new") await patchModel(settings, { openWorkspaceNewWindow: true });
              else await patchModel(settings, { openWorkspaceNewWindow: null });
            }}
            options={[
              { label: t("settings.interface.behavior_ask"), value: "ask" },
              { label: t("settings.interface.behavior_current"), value: "current" },
              { label: t("settings.interface.behavior_new"), value: "new" },
            ]}
          />
        </SettingsSection>

        <SettingsSection title={t("settings.interface.fonts_section")}>
          <SettingRow
            title={t("settings.interface.interface_font")}
            description={t("settings.interface.interface_font_desc")}
            controlClassName="gap-1"
          >
            {fonts.data && (
              <SettingSelectControl
                name="uiFont"
                label={t("settings.interface.interface_font")}
                selectClassName="w-72!"
                value={settings.interfaceFont ?? NULL_FONT_VALUE}
                defaultValue={NULL_FONT_VALUE}
                options={[
                  { label: t("settings.interface.system_default"), value: NULL_FONT_VALUE },
                  ...fonts.data.uiFonts.map((f) => ({ label: f, value: f })),
                  ...fonts.data.editorFonts.map((f) => ({ label: f, value: f })),
                ]}
                onChange={async (v) => {
                  const interfaceFont = v === NULL_FONT_VALUE ? null : v;
                  await patchModel(settings, { interfaceFont });
                }}
              />
            )}
            <SettingSelectControl
              name="interfaceFontSize"
              label={t("settings.interface.interface_font_size")}
              selectClassName="w-20!"
              value={`${settings.interfaceFontSize}`}
              defaultValue="14"
              options={fontSizeOptions}
              onChange={(v) => patchModel(settings, { interfaceFontSize: Number.parseInt(v, 10) })}
            />
          </SettingRow>

          <SettingRow
            title={t("settings.interface.editor_font")}
            description={t("settings.interface.editor_font_desc")}
            controlClassName="gap-1"
          >
            {fonts.data && (
              <SettingSelectControl
                name="editorFont"
                label={t("settings.interface.editor_font")}
                value={settings.editorFont ?? NULL_FONT_VALUE}
                defaultValue={NULL_FONT_VALUE}
                options={[
                  { label: t("settings.interface.system_default"), value: NULL_FONT_VALUE },
                  ...fonts.data.editorFonts.map((f) => ({ label: f, value: f })),
                ]}
                onChange={async (v) => {
                  const editorFont = v === NULL_FONT_VALUE ? null : v;
                  await patchModel(settings, { editorFont });
                }}
              />
            )}
            <SettingSelectControl
              name="editorFontSize"
              label={t("settings.interface.editor_font_size")}
              value={`${settings.editorFontSize}`}
              defaultValue="12"
              options={fontSizeOptions}
              onChange={(v) =>
                patchModel(settings, {
                  editorFontSize: clamp(Number.parseInt(v, 10) || 14, 8, 30),
                })
              }
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Editor">
          <ModelSettingRowSelect
            model={settings}
            modelKey="editorKeymap"
            title="Editor keymap"
            description="Keyboard shortcut preset used by text editors."
            options={keymaps}
          />
          <ModelSettingRowBoolean
            model={settings}
            modelKey="editorSoftWrap"
            title="Wrap editor lines"
            description="Wrap long lines in request and response editors."
          />
          <ModelSettingRowBoolean
            model={settings}
            modelKey="coloredMethods"
            title="Colorize request methods"
            description="Use method-specific colors for HTTP request methods."
          />
        </SettingsSection>

        <SettingsSection title={t("settings.interface.window_section")}>
          <NativeTitlebarSetting settings={settings} />
          {platform.osType() !== "macos" && (
            <ModelSettingRowBoolean
              model={settings}
              modelKey="hideWindowControls"
              title="Hide window controls"
              description="Hide the close, maximize, and minimize controls on Windows or Linux."
            />
          )}
        </SettingsSection>

        <CargoFeature feature="license">
          <LicenseSettings settings={settings} />
        </CargoFeature>
      </SettingsList>
    </VStack>
  );
}

function NativeTitlebarSetting({ settings }: { settings: Settings }) {
  const [nativeTitlebar, setNativeTitlebar] = useState(settings.useNativeTitlebar);
  const { t } = useTranslation();

  return (
    <SettingRow
      title={t("settings.interface.native_titlebar")}
      description={t("settings.interface.native_titlebar_desc")}
      controlClassName="gap-2"
    >
      <Checkbox
        hideLabel
        size="md"
        checked={nativeTitlebar}
        title="Native title bar"
        onChange={setNativeTitlebar}
      />
      {settings.useNativeTitlebar !== nativeTitlebar && (
        <Button
          color="primary"
          size="xs"
          onClick={async () => {
            await patchModel(settings, { useNativeTitlebar: nativeTitlebar });
            await rpc("cmd_restart");
          }}
        >
          Apply and Restart
        </Button>
      )}
    </SettingRow>
  );
}

function LicenseSettings({ settings }: { settings: Settings }) {
  const license = useLicense();
  if (license.check.data?.status !== "personal_use") {
    return null;
  }

  return (
    <SettingsSection title="License">
      <SettingRowBoolean
        checked={settings.hideLicenseBadge}
        title="Hide personal use badge"
        description="Hide the personal-use badge from the interface."
        onChange={async (hideLicenseBadge) => {
          if (hideLicenseBadge) {
            const confirmed = await showConfirm({
              id: "hide-license-badge",
              title: "Confirm Personal Use",
              confirmText: "Confirm",
              description: (
                <VStack space={3}>
                  <p>Hey there 👋🏼</p>
                  <p>
                    Yaak is free for personal projects and learning.{" "}
                    <strong>If you’re using Yaak at work, a license is required.</strong>
                  </p>
                  <p>
                    Licenses help keep Yaak independent and sustainable.{" "}
                    <Link href={pricingUrl("app.license.badge-hide-confirm")}>
                      Purchase a License →
                    </Link>
                  </p>
                </VStack>
              ),
              requireTyping: "Personal Use",
              color: "info",
            });
            if (!confirmed) {
              return;
            }
          }
          await patchModel(settings, { hideLicenseBadge });
        }}
      />
    </SettingsSection>
  );
}
