import { patchModel, settingsAtom } from "@yaakapp-internal/models";
import { Heading, VStack } from "@yaakapp-internal/ui";
import { useAtomValue } from "jotai";
import { useCheckForUpdates } from "../../hooks/useCheckForUpdates";
import { appInfo } from "../../lib/appInfo";
import { platform } from "@yaakapp-internal/platform";
import { CargoFeature } from "../CargoFeature";
import { CommercialUseBanner } from "../CommercialUseBanner";
import { DismissibleBanner } from "../core/DismissibleBanner";
import { IconButton } from "../core/IconButton";
import { useTranslation } from "../../lib/i18n";
import {
  ModelSettingRowBoolean,
  ModelSettingSelectControl,
  SettingValue,
  SettingRow,
  SettingRowBoolean,
  SettingRowSelect,
  SettingsList,
  SettingsSection,
} from "../core/SettingRow";

const WORKSPACE_SETTINGS_MOVED_AT = "2026-06-30";

export function SettingsGeneral() {
  const settings = useAtomValue(settingsAtom);
  const { t } = useTranslation();
  const checkForUpdates = useCheckForUpdates();
  const os = platform.osType();
  const revealTitle = t(
    `settings.general.reveal_${os === "macos" || os === "windows" ? os : "other"}`,
  );

  if (settings == null) {
    return null;
  }

  const showWorkspaceSettingsMovedBanner =
    settings.createdAt.slice(0, 10) < WORKSPACE_SETTINGS_MOVED_AT;

  return (
    <VStack space={1.5} className="mb-4">
      <div>
        <Heading>{t("settings.general.title")}</Heading>
        <p className="text-text-subtle">{t("settings.general.description")}</p>
      </div>
      <div className="mt-3 mb-5">
        <CommercialUseBanner
          source="settings-general"
          title={t("settings.general.commercial_use_title")}
        />
      </div>
      <SettingsList className="space-y-8">
        <CargoFeature feature="updater">
          <SettingsSection title={t("settings.general.updates_section")}>
            <SettingRow
              title={t("settings.general.update_channel")}
              description={t("settings.general.update_channel_desc")}
            >
              <div className="grid grid-cols-[12rem_auto] gap-1">
                <ModelSettingSelectControl
                  model={settings}
                  modelKey="updateChannel"
                  label={t("settings.general.update_channel")}
                  selectClassName="w-full!"
                  options={[
                    { label: t("settings.general.channel_stable"), value: "stable" },
                    { label: t("settings.general.channel_beta"), value: "beta" },
                  ]}
                />
                <IconButton
                  variant="border"
                  size="sm"
                  title={t("settings.general.check_for_updates")}
                  icon="refresh"
                  spin={checkForUpdates.isPending}
                  onClick={() => checkForUpdates.mutateAsync()}
                />
              </div>
            </SettingRow>

            <SettingRowSelect
              title={t("settings.general.update_behavior")}
              description={t("settings.general.update_behavior_desc")}
              name="autoupdate"
              value={settings.autoupdate ? "auto" : "manual"}
              onChange={(v) => patchModel(settings, { autoupdate: v === "auto" })}
              options={[
                { label: t("settings.general.behavior_auto"), value: "auto" },
                { label: t("settings.general.behavior_manual"), value: "manual" },
              ]}
            />

            <ModelSettingRowBoolean
              model={settings}
              modelKey="autoDownloadUpdates"
              title={t("settings.general.auto_download_updates")}
              description={t("settings.general.auto_download_updates_desc")}
              disabled={!settings.autoupdate}
            />

            <ModelSettingRowBoolean
              model={settings}
              modelKey="checkNotifications"
              title={t("settings.general.check_notifications")}
              description={t("settings.general.check_notifications_desc")}
            />

            <SettingRowBoolean
              title={t("settings.general.send_usage_statistics")}
              description={t("settings.general.send_usage_statistics_desc")}
              disabled
              checked={false}
              onChange={() => {}}
            />
          </SettingsSection>
        </CargoFeature>

        <CargoFeature feature="license">
          <SettingsSection title={t("settings.general.feedback_section")}>
            <SettingRowBoolean
              title={t("settings.general.prompt_feedback")}
              description={t("settings.general.prompt_feedback_desc")}
              checked={settings.promptFeedback}
              onChange={(promptFeedback) => patchModel(settings, { promptFeedback })}
            />
          </SettingsSection>
        </CargoFeature>

        {showWorkspaceSettingsMovedBanner && (
          <DismissibleBanner
            id="workspace-settings-moved-2026-06-30"
            color="info"
            className="w-full p-4 max-w-xl mr-auto"
          >
            <p>
              {t("settings.general.workspace_settings_moved_before")} <b>{t("workspaces.title")}</b>
              {t("settings.general.workspace_settings_moved_after")}
            </p>
          </DismissibleBanner>
        )}

        <SettingsSection title={t("settings.general.app_info_section")}>
          <SettingRow
            title={t("settings.general.version")}
            description={t("settings.general.version_desc")}
          >
            <SettingValue value={appInfo.version} />
          </SettingRow>
          <SettingRow
            title={t("settings.general.data_directory")}
            description={t("settings.general.data_directory_desc")}
            controlClassName="min-w-0 max-w-[min(42rem,55vw)] gap-2"
          >
            <SettingValue
              value={appInfo.appDataDir}
              actions={[
                {
                  title: revealTitle,
                  icon: "folder_open",
                  onClick: () => platform.revealItemInDir(appInfo.appDataDir),
                },
              ]}
            />
          </SettingRow>
          <SettingRow
            title={t("settings.general.logs_directory")}
            description={t("settings.general.logs_directory_desc")}
            controlClassName="min-w-0 max-w-[min(42rem,55vw)] gap-2"
          >
            <SettingValue
              value={appInfo.appLogDir}
              actions={[
                {
                  title: revealTitle,
                  icon: "folder_open",
                  onClick: () => platform.revealItemInDir(appInfo.appLogDir),
                },
              ]}
            />
          </SettingRow>
        </SettingsSection>
      </SettingsList>
    </VStack>
  );
}
