import { settingsAtom } from "@yaakapp-internal/models";
import { SettingsGeneral as SharedSettingsGeneral } from "@yaakapp-internal/ui";
import { useAtomValue } from "jotai";
import { useSettingsView } from "../../hooks/useSettingsView";
import { useTranslation } from "../../lib/i18n";
import { CommercialUseBanner } from "../CommercialUseBanner";
import { DismissibleBanner } from "../core/DismissibleBanner";

const WORKSPACE_SETTINGS_MOVED_AT = "2026-06-30";

export function SettingsGeneral() {
  const settings = useAtomValue(settingsAtom);
  const { t } = useTranslation();
  const bound = useSettingsView();

  if (settings == null || bound == null) {
    return null;
  }

  const showWorkspaceSettingsMovedBanner =
    settings.createdAt.slice(0, 10) < WORKSPACE_SETTINGS_MOVED_AT;

  return (
    <SharedSettingsGeneral
      view={bound.view}
      callbacks={bound.callbacks}
      banner={
        <CommercialUseBanner
          source="settings-general"
          title={t("settings.general.commercial_use_title")}
        />
      }
      extraSections={
        showWorkspaceSettingsMovedBanner && (
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
        )
      }
    />
  );
}
