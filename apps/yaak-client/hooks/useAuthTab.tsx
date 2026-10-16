import type { Folder } from "@yaakapp-internal/models";
import { patchModel } from "@yaakapp-internal/models";
import { HStack, Icon, InlineCode } from "@yaakapp-internal/ui";
import { translatedModelType, useTranslation } from "../lib/i18n";
import { useMemo } from "react";
import { openFolderSettings } from "../commands/openFolderSettings";
import { openWorkspaceSettings } from "../commands/openWorkspaceSettings";
import { IconTooltip } from "../components/core/IconTooltip";
import type { RadioDropdownProps } from "../components/core/RadioDropdown";
import type { TabItem } from "../components/core/Tabs/Tabs";
import { showConfirm } from "../lib/confirm";
import { resolvedModelName } from "../lib/resolvedModelName";
import { useHttpAuthenticationSummaries } from "./useHttpAuthentication";
import type { AuthenticatedModel } from "./useInheritedAuthentication";
import { useInheritedAuthentication } from "./useInheritedAuthentication";
import { useModelAncestors } from "./useModelAncestors";

export function useAuthTab<T extends string>(tabValue: T, model: AuthenticatedModel | null) {
  const { t } = useTranslation();
  const options = useAuthDropdownOptions(model);

  return useMemo<TabItem[]>(() => {
    if (model == null || options == null) return [];

    const tab: TabItem = {
      value: tabValue,
      label: t("request.tabs.auth"),
      options,
    };

    return [tab];
  }, [model, options, tabValue, t]);
}

export function useAuthDropdownOptions(
  model: AuthenticatedModel | null,
): Omit<RadioDropdownProps, "children"> | null {
  const { t } = useTranslation();
  const authentication = useHttpAuthenticationSummaries();
  const inheritedAuth = useInheritedAuthentication(model);
  const ancestors = useModelAncestors(model);
  const parentModel = ancestors[0] ?? null;

  return useMemo(() => {
    if (model == null) return null;

    return {
      value: model.authenticationType,
      items: [
        ...authentication.map((a) => ({
          label: a.label || t("authentication.unknown"),
          shortLabel: a.shortLabel,
          value: a.name,
        })),
        { type: "separator" },
        {
          label: t("authentication.inherit_from_parent"),
          shortLabel:
            inheritedAuth != null && inheritedAuth.authenticationType !== "none" ? (
              <HStack space={1.5}>
                {authentication.find((a) => a.name === inheritedAuth.authenticationType)
                  ?.shortLabel ?? t("authentication.unknown")}
                <IconTooltip
                  icon="zap_off"
                  iconSize="xs"
                  content={t("authentication.inherited_tooltip")}
                />
              </HStack>
            ) : (
              t("request.tabs.auth")
            ),
          value: null,
        },
        {
          label: t("authentication.no_auth"),
          shortLabel: t("authentication.no_auth"),
          value: "none",
        },
      ],
      itemsAfter: (() => {
        const actions: (
          | { type: "separator"; label: string }
          | {
              label: string;
              leftSlot: React.ReactNode;
              onSelect: () => Promise<void>;
            }
        )[] = [];

        // Promote: move auth from current model up to parent
        if (
          parentModel &&
          model.authenticationType &&
          model.authenticationType !== "none" &&
          (parentModel.authenticationType == null || parentModel.authenticationType === "none")
        ) {
          actions.push(
            { type: "separator", label: t("common.actions") },
            {
              label: t("authentication.promote_to", {
                model: translatedModelType(parentModel.model),
              }),
              leftSlot: (
                <Icon icon={parentModel.model === "workspace" ? "corner_right_up" : "folder_up"} />
              ),
              onSelect: async () => {
                const confirmed = await showConfirm({
                  id: "promote-auth-confirm",
                  title: t("authentication.promote_title"),
                  confirmText: t("authentication.promote"),
                  description: (
                    <>
                      {t("authentication.promote_description_before")}
                      <InlineCode>{resolvedModelName(parentModel)}</InlineCode>
                      {t("authentication.promote_description_after")}
                    </>
                  ),
                });
                if (confirmed) {
                  await patchModel(model, {
                    authentication: {},
                    authenticationType: null,
                  });
                  await patchModel(parentModel, {
                    authentication: model.authentication,
                    authenticationType: model.authenticationType,
                  });

                  if (parentModel.model === "folder") {
                    openFolderSettings(parentModel.id, "auth");
                  } else {
                    openWorkspaceSettings("auth");
                  }
                }
              },
            },
          );
        }

        // Copy from ancestor: copy auth config down to current model
        const ancestorWithAuth = ancestors.find(
          (a) => a.authenticationType != null && a.authenticationType !== "none",
        );
        if (ancestorWithAuth) {
          if (actions.length === 0) {
            actions.push({ type: "separator", label: t("common.actions") });
          }
          actions.push({
            label: t("authentication.copy_from", {
              model: translatedModelType(ancestorWithAuth.model),
            }),
            leftSlot: (
              <Icon
                icon={ancestorWithAuth.model === "workspace" ? "corner_right_down" : "folder_down"}
              />
            ),
            onSelect: async () => {
              const confirmed = await showConfirm({
                id: "copy-auth-confirm",
                title: t("authentication.copy_title"),
                confirmText: t("common.copy"),
                description: (
                  <>
                    {t("authentication.copy_description_before")}
                    {authentication.find((a) => a.name === ancestorWithAuth.authenticationType)
                      ?.label ?? t("authentication.authentication")}
                    {t("authentication.copy_description_from")}
                    <InlineCode>{resolvedModelName(ancestorWithAuth)}</InlineCode>
                    {t("authentication.copy_description_after", {
                      model: translatedModelType(ancestorWithAuth.model).toLowerCase(),
                    })}
                  </>
                ),
              });
              if (confirmed) {
                await patchModel(model, {
                  authentication: { ...ancestorWithAuth.authentication },
                  authenticationType: ancestorWithAuth.authenticationType,
                });
              }
            },
          });
        }

        return actions.length > 0 ? actions : undefined;
      })(),
      onChange: async (authenticationType) => {
        let authentication: Folder["authentication"] = model.authentication;
        if (model.authenticationType !== authenticationType) {
          authentication = {
            // Reset auth if changing types
          };
        }
        await patchModel(model, { authentication, authenticationType });
      },
    };
  }, [authentication, inheritedAuth, model, parentModel, ancestors, t]);
}
