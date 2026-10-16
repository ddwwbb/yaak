import { VStack } from "@yaakapp-internal/ui";
import { useTranslation } from "../lib/i18n";

export function EncryptionHelp() {
  const { t } = useTranslation();
  return (
    <VStack space={3}>
      <p>{t("workspaces.encryption_help_sensitive")}</p>
      <p>{t("workspaces.encryption_help_sharing")}</p>
    </VStack>
  );
}
