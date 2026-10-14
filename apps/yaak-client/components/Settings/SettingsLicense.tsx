import { useLicense } from "@yaakapp-internal/license";
import { Banner, HStack, Icon, VStack } from "@yaakapp-internal/ui";
import { differenceInDays } from "date-fns";
import { formatDate } from "date-fns/format";
import { useState } from "react";
import { useTranslation } from "../../lib/i18n";
import { useToggle } from "../../hooks/useToggle";
import { pluralizeCount } from "../../lib/pluralize";
import { pricingUrl } from "../../lib/pricingUrl";
import { CargoFeature } from "../CargoFeature";
import { Button } from "../core/Button";
import { Link } from "../core/Link";
import { PlainInput } from "../core/PlainInput";
import { Separator } from "../core/Separator";
import { platform } from "@yaakapp-internal/platform";

export function SettingsLicense() {
  return (
    <CargoFeature feature="license">
      <SettingsLicenseCmp />
    </CargoFeature>
  );
}

function SettingsLicenseCmp() {
  const { check, activate, deactivate } = useLicense();
  const { t } = useTranslation();
  const [key, setKey] = useState<string>("");
  const [activateFormVisible, toggleActivateFormVisible] = useToggle(false);

  if (check.isPending) {
    return null;
  }

  const renderBanner = () => {
    if (!check.data) return null;

    switch (check.data.status) {
      case "active":
        return <Banner color="success">{t("settings.license.active_banner")}</Banner>;

      case "trialing":
        return (
          <Banner color="info" className="max-w-lg">
            <p className="w-full">
              <strong>
                {pluralizeCount("day", differenceInDays(check.data.data.end, new Date()))}
              </strong>{" "}
              left to evaluate Yaak for commercial use.
              <br />
              <span className="opacity-50">Personal use is always free, forever.</span>
              <Separator className="my-2" />
              <div className="flex flex-wrap items-center gap-x-2 text-sm text-notice">
                <Link noUnderline href={pricingUrl(`app.license.learn.${check.data.status}`)}>
                  {t("common.learn_more")}
                </Link>
              </div>
            </p>
          </Banner>
        );

      case "personal_use":
        return (
          <Banner color="notice" className="max-w-lg">
            <p className="w-full">
              Your commercial-use trial has ended.
              <br />
              <span className="opacity-50">
                You may continue using Yaak for personal use only.
                <br />A license is required for commercial use.
              </span>
              <Separator className="my-2" />
              <div className="flex flex-wrap items-center gap-x-2 text-sm text-notice">
                <Link noUnderline href={pricingUrl(`app.license.learn.${check.data.status}`)}>
                  {t("common.learn_more")}
                </Link>
              </div>
            </p>
          </Banner>
        );

      case "inactive":
        return (
          <Banner color="danger">
            {t("settings.license.inactive_banner")}
            for more details
          </Banner>
        );

      case "expired":
        return (
          <Banner color="notice">
            Your license expired{" "}
            <strong>{formatDate(check.data.data.periodEnd, "MMMM dd, yyyy")}</strong>. Please{" "}
            <Link href="https://yaak.app/dashboard">Resubscribe</Link> to continue receiving
            updates.
            {check.data.data.changesUrl && (
              <>
                <br />
                <Link href={check.data.data.changesUrl}>What's new in latest builds</Link>
              </>
            )}
          </Banner>
        );

      case "past_due":
        return (
          <Banner color="danger">
            <strong>Your payment method needs attention.</strong>
            <br />
            To re-activate your license, please{" "}
            <Link href={check.data.data.billingUrl}>update your billing info</Link>.
          </Banner>
        );

      case "error":
        return (
          <Banner color="danger">
            License check failed: {check.data.data.message} (Code: {check.data.data.code})
          </Banner>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {renderBanner()}

      {check.error && <Banner color="danger">{check.error}</Banner>}
      {activate.error && <Banner color="danger">{activate.error}</Banner>}

      {check.data?.status === "active" ? (
        <HStack space={2}>
          <Button variant="border" color="secondary" size="sm" onClick={() => deactivate.mutate()}>
            {t("settings.license.deactivate")}
          </Button>
          <Button
            color="secondary"
            size="sm"
            onClick={() =>
              platform.openUrl("https://yaak.app/dashboard?intent=app.license.support")
            }
            rightSlot={<Icon icon="external_link" />}
          >
            {t("settings.license.direct_support")}
          </Button>
        </HStack>
      ) : (
        <HStack space={2}>
          <Button variant="border" color="secondary" size="sm" onClick={toggleActivateFormVisible}>
            {t("settings.license.activate_license")}
          </Button>
          <Button
            size="sm"
            color="primary"
            rightSlot={<Icon icon="external_link" />}
            onClick={() =>
              platform.openUrl(
                pricingUrl(`app.license.purchase.${check.data?.status ?? "unknown"}`),
              )
            }
          >
            {t("settings.license.purchase_license")}
          </Button>
        </HStack>
      )}

      {activateFormVisible && (
        <VStack
          as="form"
          space={3}
          className="max-w-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            await activate.mutateAsync({ licenseKey: key });
            toggleActivateFormVisible();
          }}
        >
          <PlainInput
            autoFocus
            label={t("settings.license.license_key")}
            name="key"
            onChange={setKey}
            placeholder="YK1-XXXXX-XXXXX-XXXXX-XXXXX"
          />
          <Button type="submit" color="primary" size="sm" isLoading={activate.isPending}>
            {t("common.submit")}
          </Button>
        </VStack>
      )}
    </div>
  );
}
