import { pluralizeCount } from "@yaakapp-internal/lib/pluralize";
import { differenceInDays } from "date-fns";
import { formatDate } from "date-fns/format";
import { useState } from "react";
import { useToggle } from "../../hooks/useToggle";
import { useUiTranslation } from "../../lib/uiTranslation";
import { Banner } from "../Banner";
import { Button } from "../Button";
import { ExternalLink } from "../ExternalLink";
import { Icon } from "../Icon";
import { PlainInput } from "../PlainInput";
import { Separator } from "../Separator";
import { HStack, VStack } from "../Stacks";
import type { SettingsCallbacks, SettingsLicenseStatus, SettingsView } from "./types";

export interface SettingsLicenseProps {
  view: Pick<SettingsView, "app" | "license">;
  callbacks: Pick<
    SettingsCallbacks,
    "onActivateLicense" | "onDeactivateLicense" | "onOpenUrl" | "pricingUrl"
  >;
}

export function SettingsLicense({ view, callbacks }: SettingsLicenseProps) {
  const { t } = useUiTranslation();
  const [key, setKey] = useState<string>("");
  const [activateFormVisible, toggleActivateFormVisible] = useToggle(false);
  const license = view.license;

  if (license == null || license.pending) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {license.status && (
        <LicenseStatusBanner
          status={license.status}
          appName={view.app.name}
          callbacks={callbacks}
        />
      )}

      {license.checkError && <Banner color="danger">{license.checkError}</Banner>}
      {license.activateError && <Banner color="danger">{license.activateError}</Banner>}

      {license.status?.status === "active" ? (
        <HStack space={2}>
          <Button
            variant="border"
            color="secondary"
            size="sm"
            onClick={() => callbacks.onDeactivateLicense()}
          >
            {t("settings.license.deactivate", undefined, "Deactivate License")}
          </Button>
          <Button
            color="secondary"
            size="sm"
            onClick={() =>
              callbacks.onOpenUrl("https://yaak.app/dashboard?intent=app.license.support")
            }
            rightSlot={<Icon icon="external_link" />}
          >
            {t("settings.license.direct_support", undefined, "Direct Support")}
          </Button>
        </HStack>
      ) : (
        <HStack space={2}>
          <Button variant="border" color="secondary" size="sm" onClick={toggleActivateFormVisible}>
            {t("settings.license.activate_license", undefined, "Activate License")}
          </Button>
          <Button
            size="sm"
            color="primary"
            rightSlot={<Icon icon="external_link" />}
            onClick={() =>
              callbacks.onOpenUrl(
                callbacks.pricingUrl(`app.license.purchase.${license.status?.status ?? "unknown"}`),
              )
            }
          >
            {t("settings.license.purchase_license", undefined, "Purchase License")}
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
            await callbacks.onActivateLicense(key);
            toggleActivateFormVisible();
          }}
        >
          <PlainInput
            autoFocus
            label={t("settings.license.license_key", undefined, "License Key")}
            name="key"
            onChange={setKey}
            placeholder="YK1-XXXXX-XXXXX-XXXXX-XXXXX"
          />
          <Button type="submit" color="primary" size="sm" isLoading={license.activating}>
            {t("common.submit", undefined, "Submit")}
          </Button>
        </VStack>
      )}
    </div>
  );
}

function LicenseStatusBanner({
  status,
  appName,
  callbacks,
}: {
  status: SettingsLicenseStatus;
  appName: string;
  callbacks: SettingsLicenseProps["callbacks"];
}) {
  const { t } = useUiTranslation();
  const link = (href: string, children: string, noUnderline?: boolean) => (
    <ExternalLink href={href} noUnderline={noUnderline} onOpen={callbacks.onOpenUrl}>
      {children}
    </ExternalLink>
  );

  switch (status.status) {
    case "active":
      return (
        <Banner color="success">
          {t("settings.license.active_banner", undefined, "Your license is active 🥳")}
        </Banner>
      );

    case "trialing": {
      const days = differenceInDays(status.trialEnd, new Date());
      return (
        <Banner color="info" className="max-w-lg">
          <p className="w-full">
            <strong>
              {t("settings.license.trial_days", { days }, pluralizeCount("day", days))}
            </strong>{" "}
            {t(
              "settings.license.trialing_banner",
              { appName },
              "left to evaluate {appName} for commercial use.",
            )}
            <br />
            <span className="opacity-50">
              {t(
                "settings.license.personal_use_free",
                undefined,
                "Personal use is always free, forever.",
              )}
            </span>
            <Separator className="my-2" />
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-notice">
              {link(
                callbacks.pricingUrl(`app.license.learn.${status.status}`),
                t("common.learn_more", undefined, "Learn More"),
                true,
              )}
            </div>
          </p>
        </Banner>
      );
    }

    case "personal_use":
      return (
        <Banner color="notice" className="max-w-lg">
          <p className="w-full">
            {t(
              "settings.license.personal_use_banner",
              undefined,
              "Your commercial-use trial has ended.",
            )}
            <br />
            <span className="opacity-50">
              {t(
                "settings.license.personal_use_only",
                { appName },
                "You may continue using {appName} for personal use only.",
              )}
              <br />
              {t(
                "settings.license.commercial_use_requires_license",
                undefined,
                "A license is required for commercial use.",
              )}
            </span>
            <Separator className="my-2" />
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-notice">
              {link(
                callbacks.pricingUrl(`app.license.learn.${status.status}`),
                t("common.learn_more", undefined, "Learn More"),
                true,
              )}
            </div>
          </p>
        </Banner>
      );

    case "inactive":
      return (
        <Banner color="danger">
          {t("settings.license.inactive_banner", undefined, "Your license is invalid. Please ")}
          {link("https://yaak.app/dashboard", t("settings.license.sign_in", undefined, "Sign In"))}
          {t("settings.license.inactive_banner_after_link", undefined, " for more details")}
        </Banner>
      );

    case "expired":
      return (
        <Banner color="notice">
          {t("settings.license.expired_banner", undefined, "Your license expired ")}
          <strong>
            {formatDate(
              status.periodEnd,
              t("settings.license.expired_date_format", undefined, "MMMM dd, yyyy"),
            )}
          </strong>
          {t("settings.license.expired_banner_after_date", undefined, ". Please ")}
          {link(
            "https://yaak.app/dashboard",
            t("settings.license.resubscribe", undefined, "Resubscribe"),
          )}
          {t(
            "settings.license.expired_banner_after_link",
            undefined,
            " to continue receiving updates.",
          )}
          {status.changesUrl && (
            <>
              <br />
              {link(
                status.changesUrl,
                t("settings.license.latest_changes", undefined, "What's new in latest builds"),
              )}
            </>
          )}
        </Banner>
      );

    case "past_due":
      return (
        <Banner color="danger">
          <strong>
            {t(
              "settings.license.past_due_banner",
              undefined,
              "Your payment method needs attention.",
            )}
          </strong>
          <br />
          {t(
            "settings.license.billing_instructions",
            undefined,
            "To re-activate your license, please ",
          )}
          {link(
            status.billingUrl,
            t("settings.license.update_billing_info", undefined, "update your billing info"),
          )}
          {t("settings.license.billing_instructions_after_link", undefined, ".")}
        </Banner>
      );

    case "error":
      return (
        <Banner color="danger">
          {t(
            "settings.license.check_failed",
            { message: status.message, code: status.code },
            "License check failed: {message} (Code: {code})",
          )}
        </Banner>
      );
  }
}
