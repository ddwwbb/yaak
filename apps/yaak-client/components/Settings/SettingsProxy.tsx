import { patchModel, settingsAtom } from "@yaakapp-internal/models";
import type { ProxySetting } from "@yaakapp-internal/models";
import { Heading, InlineCode, VStack } from "@yaakapp-internal/ui";
import { useTranslation } from "../../lib/i18n";
import { useAtomValue } from "jotai";
import { CommercialUseBanner } from "../CommercialUseBanner";
import {
  SettingRowBoolean,
  SettingRowSelect,
  SettingRowText,
  SettingsList,
  SettingsSection,
} from "../core/SettingRow";

export function SettingsProxy() {
  const settings = useAtomValue(settingsAtom);
  const { t } = useTranslation();
  const proxy = enabledProxyOrDefault(settings.proxy);

  const patchProxy = async (patch: Partial<EnabledProxySetting>) => {
    await patchModel(settings, {
      proxy: {
        ...proxy,
        ...patch,
        auth: Object.hasOwn(patch, "auth") ? (patch.auth ?? null) : proxy.auth,
      },
    });
  };

  return (
    <VStack space={1.5} className="mb-4">
      <div className="mb-3">
        <Heading>{t("settings.proxy.title")}</Heading>
        <p className="text-text-subtle">{t("settings.proxy.description")}</p>
      </div>
      <CommercialUseBanner source="proxy-settings" title="Using a proxy for work?" />
      <SettingsList className="space-y-8">
        <SettingsSection title={t("settings.proxy.mode_title")}>
          <SettingRowSelect
            title={t("settings.proxy.mode_title")}
            description={t("settings.proxy.mode_desc")}
            name="proxy"
            value={settings.proxy?.type ?? "automatic"}
            onChange={async (v) => {
              if (v === "automatic") {
                await patchModel(settings, { proxy: undefined });
              } else if (v === "enabled") {
                await patchModel(settings, { proxy });
              } else {
                await patchModel(settings, { proxy: { type: "disabled" } });
              }
            }}
            options={[
              { label: t("settings.proxy.mode_auto"), value: "automatic" },
              { label: t("settings.proxy.mode_custom"), value: "enabled" },
              { label: t("settings.proxy.mode_disabled"), value: "disabled" },
            ]}
            selectClassName="w-64!"
          />
        </SettingsSection>

        {settings.proxy?.type === "enabled" && (
          <>
            <SettingsSection title={t("settings.proxy.custom_section")}>
              <SettingRowBoolean
                checked={!settings.proxy.disabled}
                title={t("settings.proxy.enable_proxy")}
                description={t("settings.proxy.enable_proxy_desc")}
                onChange={(enabled) => patchProxy({ disabled: !enabled })}
              />
              <SettingRowText
                name="proxyHttp"
                title={t("settings.proxy.http_traffic")}
                description={t("settings.proxy.http_traffic_desc")}
                value={settings.proxy.http}
                placeholder="localhost:9090"
                onChange={(http) => patchProxy({ http })}
              />
              <SettingRowText
                name="proxyHttps"
                title={t("settings.proxy.https_traffic")}
                description={t("settings.proxy.https_traffic_desc")}
                value={settings.proxy.https}
                placeholder="localhost:9090"
                onChange={(https) => patchProxy({ https })}
              />
              <SettingRowText
                name="proxyBypass"
                title={t("settings.proxy.bypass_title")}
                description={t("settings.proxy.bypass_desc")}
                value={settings.proxy.bypass}
                placeholder="127.0.0.1, *.example.com, localhost:3000"
                inputWidthClassName="w-96!"
                onChange={(bypass) => patchProxy({ bypass })}
              />
            </SettingsSection>

            <SettingsSection title={t("settings.proxy.auth_section")}>
              <SettingRowBoolean
                checked={settings.proxy.auth != null}
                title={t("settings.proxy.enable_auth")}
                description={t("settings.proxy.enable_auth_desc")}
                onChange={(enabled) =>
                  patchProxy({ auth: enabled ? { user: "", password: "" } : null })
                }
              />

              {settings.proxy.auth != null && (
                <>
                  <SettingRowText
                    required
                    name="proxyUser"
                    title={t("settings.proxy.user")}
                    description={t("settings.proxy.user_desc")}
                    value={settings.proxy.auth.user}
                    placeholder="myUser"
                    onChange={(user) =>
                      patchProxy({
                        auth: {
                          user,
                          password:
                            settings.proxy?.type === "enabled"
                              ? (settings.proxy.auth?.password ?? "")
                              : "",
                        },
                      })
                    }
                  />
                  <SettingRowText
                    name="proxyPassword"
                    title={t("settings.proxy.password")}
                    description={t("settings.proxy.password_desc")}
                    value={settings.proxy.auth.password}
                    placeholder="s3cretPassw0rd"
                    type="password"
                    onChange={(password) =>
                      patchProxy({
                        auth: {
                          user:
                            settings.proxy?.type === "enabled"
                              ? (settings.proxy.auth?.user ?? "")
                              : "",
                          password,
                        },
                      })
                    }
                  />
                </>
              )}
            </SettingsSection>
          </>
        )}
      </SettingsList>
    </VStack>
  );
}

type EnabledProxySetting = Extract<ProxySetting, { type: "enabled" }>;

function enabledProxyOrDefault(proxy: ProxySetting | null): EnabledProxySetting {
  if (proxy?.type === "enabled") return proxy;

  return {
    disabled: false,
    type: "enabled",
    http: "",
    https: "",
    auth: { user: "", password: "" },
    bypass: "",
  };
}
