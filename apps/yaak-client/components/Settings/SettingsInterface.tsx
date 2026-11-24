import { useLicense } from "@yaakapp-internal/license";
import type { Settings } from "@yaakapp-internal/models";
import { patchModel, settingsAtom } from "@yaakapp-internal/models";
import { SettingsInterface as SharedSettingsInterface, VStack } from "@yaakapp-internal/ui";
import { useAtomValue } from "jotai";
import { activeWorkspaceAtom } from "../../hooks/useActiveWorkspace";
import { useSettingsView } from "../../hooks/useSettingsView";
import { showConfirm } from "../../lib/confirm";
import { type SupportedLanguage, useTranslation } from "../../lib/i18n";
import { pricingUrl } from "../../lib/pricingUrl";
import { CargoFeature } from "../CargoFeature";
import { Link } from "../core/Link";
import { SettingRowBoolean, SettingRowSelect, SettingsSection } from "../core/SettingRow";

export function SettingsInterface() {
  const workspace = useAtomValue(activeWorkspaceAtom);
  const settings = useAtomValue(settingsAtom);
  const { t, language, setLanguage } = useTranslation();
  const bound = useSettingsView();

  if (settings == null || workspace == null || bound == null) {
    return null;
  }

  return (
    <SharedSettingsInterface
      view={bound.view}
      callbacks={bound.callbacks}
      leadingSections={
        <>
          <SettingsSection title={t("settings.interface.language")}>
            <SettingRowSelect<SupportedLanguage>
              title={t("settings.interface.language")}
              description={t("settings.interface.language_desc")}
              name="interfaceLanguage"
              value={language}
              onChange={setLanguage}
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
        </>
      }
      trailingSections={
        <CargoFeature feature="license">
          <LicenseSettings settings={settings} />
        </CargoFeature>
      }
    />
  );
}

function LicenseSettings({ settings }: { settings: Settings }) {
  const license = useLicense();
  const { t } = useTranslation();
  if (license.check.data?.status !== "personal_use") {
    return null;
  }

  return (
    <SettingsSection title={t("settings.tabs.license")}>
      <SettingRowBoolean
        checked={settings.hideLicenseBadge}
        title={t("settings.interface.hide_license_badge")}
        description={t("settings.interface.hide_license_badge_desc")}
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
