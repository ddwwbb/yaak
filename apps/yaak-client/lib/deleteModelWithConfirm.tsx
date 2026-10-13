import type { AnyModel } from "@yaakapp-internal/models";
import { deleteModel, modelTypeLabel } from "@yaakapp-internal/models";
import { InlineCode } from "@yaakapp-internal/ui";
import { Prose } from "../components/Prose";
import { showConfirmDelete } from "./confirm";
import { pluralizeCount } from "./pluralize";
import { t, translatedModelType } from "./i18n";
import { resolvedModelName } from "./resolvedModelName";

export async function deleteModelWithConfirm(
  model: AnyModel | AnyModel[] | null,
  options: { confirmName?: string } = {},
): Promise<boolean> {
  if (model == null) {
    console.warn("Tried to delete null model");
    return false;
  }
  const models = Array.isArray(model) ? model : [model];
  const firstModel = models[0];
  if (firstModel == null) return false;

  const descriptor =
    models.length === 1
      ? translatedModelType(firstModel.model)
      : pluralizeCount("Item", models.length);
  const confirmed = await showConfirmDelete({
    id: `delete-model-${models.map((m) => m.id).join(",")}`,
    title: t("dialogs.confirm_delete.title", { item: descriptor }),
    confirmText: t("common.delete"),
    requireTyping: options.confirmName,
    description: (
      <>
        {t("dialogs.confirm_delete.permanently_delete")}{" "}
        {models.length === 1 ? (
          <>
            <InlineCode>{resolvedModelName(firstModel)}</InlineCode>?
          </>
        ) : models.length < 10 ? (
          <>
            the following?
            <Prose className="mt-2">
              <ul className="space-y-1">
                {models.map((m) => (
                  <li key={m.id}>
                    <InlineCode
                      className="inline-block truncate align-bottom max-w-full"
                      title={resolvedModelName(m)}
                    >
                      {resolvedModelName(m)}
                    </InlineCode>
                  </li>
                ))}
              </ul>
            </Prose>
          </>
        ) : (
          `all ${pluralizeCount("item", models.length)}?`
        )}
      </>
    ),
  });

  if (!confirmed) {
    return false;
  }

  await Promise.allSettled(models.map((m) => deleteModel(m)));
  return true;
}
