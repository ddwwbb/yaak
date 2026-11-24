import type { ReactNode } from "react";
import { useUiTranslation } from "../../lib/uiTranslation";
import { IconButton } from "../IconButton";
import {
  SettingRow,
  SettingRowBoolean,
  SettingRowSelect,
  SettingSelectControl,
  SettingsList,
  SettingsSection,
  SettingValue,
} from "./SettingRow";
import { SettingsPage } from "./SettingsPage";
import type { SettingsCallbacks, SettingsView } from "./types";

export interface SettingsGeneralProps {
  view: SettingsView;
  callbacks: SettingsCallbacks;
  /** Shown under the heading, like the client's commercial-use banner */
  banner?: ReactNode;
  /** Sections only this app has, shown before App Info */
  extraSections?: ReactNode;
}

export function SettingsGeneral({ view, callbacks, banner, extraSections }: SettingsGeneralProps) {
  const { t } = useUiTranslation();
  const { app, values } = view;
  const appParams = { appName: app.name };
  return (
    <SettingsPage
      title={t("settings.general.title", undefined, "General")}
      description={t(
        "settings.general.description",
        undefined,
        "Configure general settings for update behavior and more.",
      )}
      banner={banner}
    >
      <SettingsList className="space-y-8">
        {view.updates != null && <SettingsUpdatesSection view={view} callbacks={callbacks} />}

        {view.feedbackPrompts && (
          <SettingsSection title={t("settings.general.feedback_section", undefined, "Feedback")}>
            <SettingRowBoolean
              title={t("settings.general.prompt_feedback", undefined, "Prompt for feedback")}
              description={t(
                "settings.general.prompt_feedback_desc",
                undefined,
                "Show rare one-time prompts asking how new features are working.",
              )}
              checked={values.promptFeedback}
              onChange={(promptFeedback) => callbacks.onChange({ promptFeedback })}
            />
          </SettingsSection>
        )}

        {extraSections}

        <SettingsSection title={t("settings.general.app_info_section", undefined, "App Info")}>
          <SettingRow
            title={t("settings.general.version", undefined, "Version")}
            description={t(
              "settings.general.version_desc",
              appParams,
              "Current {appName} version.",
            )}
          >
            <SettingValue value={app.version} />
          </SettingRow>
          <SettingRow
            title={t("settings.general.data_directory", undefined, "Data Directory")}
            description={t(
              "settings.general.data_directory_desc",
              appParams,
              "Where {appName} stores application data.",
            )}
            controlClassName="min-w-0 max-w-[min(42rem,55vw)] gap-2"
          >
            <SettingValue
              value={app.dataDir}
              actions={[
                {
                  title: app.revealPathLabel,
                  icon: "folder_open",
                  onClick: () => callbacks.onRevealPath(app.dataDir),
                },
              ]}
            />
          </SettingRow>
          <SettingRow
            title={t("settings.general.logs_directory", undefined, "Logs Directory")}
            description={t(
              "settings.general.logs_directory_desc",
              appParams,
              "Where {appName} writes application logs.",
            )}
            controlClassName="min-w-0 max-w-[min(42rem,55vw)] gap-2"
          >
            <SettingValue
              value={app.logDir}
              actions={[
                {
                  title: app.revealPathLabel,
                  icon: "folder_open",
                  onClick: () => callbacks.onRevealPath(app.logDir),
                },
              ]}
            />
          </SettingRow>
        </SettingsSection>
      </SettingsList>
    </SettingsPage>
  );
}

/** The update channel, how updates install, and the check button */
export function SettingsUpdatesSection({
  view,
  callbacks,
}: {
  view: Pick<SettingsView, "app" | "values" | "updates">;
  callbacks: Pick<SettingsCallbacks, "onChange" | "onCheckForUpdates">;
}) {
  const { t } = useUiTranslation();
  const { app, values } = view;
  const appParams = { appName: app.name };
  const updateChannelLabel = t("settings.general.update_channel", undefined, "Update Channel");
  return (
    <SettingsSection title={t("settings.general.updates_section", undefined, "Updates")}>
      <SettingRow
        title={updateChannelLabel}
        description={t(
          "settings.general.update_channel_desc",
          appParams,
          "Choose whether {appName} should use stable releases or beta releases.",
        )}
      >
        <div className="grid grid-cols-[12rem_auto] gap-1">
          <SettingSelectControl
            name="updateChannel"
            label={updateChannelLabel}
            selectClassName="w-full!"
            value={values.updateChannel}
            onChange={(updateChannel) => callbacks.onChange({ updateChannel })}
            options={[
              { label: t("settings.general.channel_stable", undefined, "Stable"), value: "stable" },
              { label: t("settings.general.channel_beta", undefined, "Beta"), value: "beta" },
            ]}
          />
          <IconButton
            variant="border"
            size="sm"
            title={t("settings.general.check_for_updates", undefined, "Check for updates")}
            icon="refresh"
            spin={view.updates?.checking ?? false}
            onClick={() => callbacks.onCheckForUpdates()}
          />
        </div>
      </SettingRow>

      <SettingRowSelect
        title={t("settings.general.update_behavior", undefined, "Update Behavior")}
        description={t(
          "settings.general.update_behavior_desc",
          undefined,
          "Choose whether updates are installed automatically or manually.",
        )}
        name="autoupdate"
        value={values.autoupdate ? "auto" : "manual"}
        onChange={(v) => callbacks.onChange({ autoupdate: v === "auto" })}
        options={[
          { label: t("settings.general.behavior_auto", undefined, "Automatic"), value: "auto" },
          { label: t("settings.general.behavior_manual", undefined, "Manual"), value: "manual" },
        ]}
      />

      <SettingRowBoolean
        title={t(
          "settings.general.auto_download_updates",
          undefined,
          "Automatically download updates",
        )}
        description={t(
          "settings.general.auto_download_updates_desc",
          appParams,
          "Download {appName} updates in the background so they are ready to install.",
        )}
        disabled={!values.autoupdate}
        checked={values.autoDownloadUpdates}
        onChange={(autoDownloadUpdates) => callbacks.onChange({ autoDownloadUpdates })}
      />

      {view.updates?.notificationsSetting !== false && (
        <SettingRowBoolean
          title={t("settings.general.check_notifications", undefined, "Check for notifications")}
          description={t(
            "settings.general.check_notifications_desc",
            undefined,
            "Periodically ping Yaak servers to check for relevant notifications.",
          )}
          checked={values.checkNotifications}
          onChange={(checkNotifications) => callbacks.onChange({ checkNotifications })}
        />
      )}

      <SettingRowBoolean
        title={t(
          "settings.general.send_usage_statistics",
          undefined,
          "Send anonymous usage statistics",
        )}
        description={t(
          "settings.general.send_usage_statistics_desc",
          appParams,
          "{appName} is local-first and does not collect analytics or usage data.",
        )}
        disabled
        checked={false}
        onChange={() => {}}
      />
    </SettingsSection>
  );
}
