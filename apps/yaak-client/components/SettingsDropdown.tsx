import { useLicense } from "@yaakapp-internal/license";
import { useTranslation } from "../lib/i18n";
import { useRef } from "react";
import { openSettings } from "../commands/openSettings";
import { useCheckForUpdates } from "../hooks/useCheckForUpdates";
import { useExportData } from "../hooks/useExportData";
import { appInfo } from "../lib/appInfo";
import { showDialog } from "../lib/dialog";
import { importData } from "../lib/importData";
import { pricingUrl } from "../lib/pricingUrl";
import type { DropdownRef } from "./core/Dropdown";
import { Dropdown } from "./core/Dropdown";
import { Icon } from "@yaakapp-internal/ui";
import { IconButton } from "./core/IconButton";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { platform } from "@yaakapp-internal/platform";

export function SettingsDropdown() {
  const exportData = useExportData();
  const dropdownRef = useRef<DropdownRef>(null);
  const checkForUpdates = useCheckForUpdates();
  const { check } = useLicense();
  const { t } = useTranslation();
  return (
    <Dropdown
      ref={dropdownRef}
      items={[
        {
          label: t("menu.settings"),
          hotKeyAction: "settings.show",
          leftSlot: <Icon icon="settings" />,
          onSelect: () => openSettings.mutate(null),
        },
        {
          label: t("menu.keyboard_shortcuts"),
          hotKeyAction: "hotkeys.showHelp",
          leftSlot: <Icon icon="keyboard" />,
          onSelect: () => {
            showDialog({
              id: "hotkey",
              title: t("menu.keyboard_shortcuts"),
              size: "dynamic",
              render: () => <KeyboardShortcutsDialog />,
            });
          },
        },
        {
          label: t("menu.plugins"),
          leftSlot: <Icon icon="puzzle" />,
          onSelect: () => openSettings.mutate("plugins"),
        },
        { type: "separator", label: t("menu.share_workspaces") },
        {
          label: t("menu.import_data"),
          leftSlot: <Icon icon="folder_input" />,
          onSelect: () => importData.mutate(),
        },
        {
          label: t("menu.export_data"),
          leftSlot: <Icon icon="folder_output" />,
          onSelect: () => exportData.mutate(),
        },
        {
          label: t("menu.create_run_button"),
          leftSlot: <Icon icon="rocket" />,
          onSelect: () => platform.openUrl("https://yaak.app/button/new"),
        },
        { type: "separator", label: `Yaak v${appInfo.version}` },
        {
          label: t("menu.check_for_updates"),
          leftSlot: <Icon icon="update" />,
          hidden: !appInfo.featureUpdater,
          onSelect: () => checkForUpdates.mutate(),
        },
        {
          label: t("menu.purchase_license"),
          color: "success",
          hidden: check.data == null || check.data.status === "active",
          leftSlot: <Icon icon="circle_dollar_sign" />,
          rightSlot: <Icon icon="external_link" color="success" className="opacity-60" />,
          onSelect: () =>
            platform.openUrl(pricingUrl(`app.menu.purchase.${check.data?.status ?? "unknown"}`)),
        },
        {
          label: t("menu.install_cli"),
          hidden: appInfo.cliVersion != null,
          leftSlot: <Icon icon="square_terminal" />,
          rightSlot: <Icon icon="external_link" color="secondary" />,
          onSelect: () => platform.openUrl("https://yaak.app/docs/cli"),
        },
        {
          label: t("menu.feedback"),
          leftSlot: <Icon icon="chat" />,
          rightSlot: <Icon icon="external_link" color="secondary" />,
          onSelect: () => platform.openUrl("https://yaak.app/feedback"),
        },
        {
          label: "Changelog",
          leftSlot: <Icon icon="cake" />,
          rightSlot: <Icon icon="external_link" color="secondary" />,
          onSelect: () => platform.openUrl(`https://yaak.app/changelog/${appInfo.version}`),
        },
      ]}
    >
      <IconButton
        size="sm"
        title={t("menu.settings")}
        icon="settings"
        iconColor="secondary"
        className="pointer-events-auto"
      />
    </Dropdown>
  );
}
