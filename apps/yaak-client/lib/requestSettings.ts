import type { AnyModel, Workspace } from "@yaakapp-internal/models";

type ModelType = AnyModel["model"];

type WorkspaceRequestSettings = Pick<
  Workspace,
  | "settingFollowRedirects"
  | "settingHttpVersion"
  | "settingRequestMessageSize"
  | "settingRequestTimeout"
  | "settingSendCookies"
  | "settingStoreCookies"
  | "settingValidateCertificates"
>;

type ModelForType<T extends ModelType> = Extract<AnyModel, { model: T }>;

type ModelTypeWithSetting<K extends RequestSettingKey> = {
  [M in ModelType]: K extends keyof ModelForType<M> ? M : never;
}[ModelType];

export type RequestSettingDefinition<K extends RequestSettingKey = RequestSettingKey> = {
  defaultValue: WorkspaceRequestSettings[K];
  modelKey: K;
  models: readonly ModelTypeWithSetting<K>[];
};

export type RequestSettingKey = keyof WorkspaceRequestSettings;

function defineRequestSetting<const K extends RequestSettingKey>(
  setting: RequestSettingDefinition<K>,
) {
  return setting;
}

export const SETTING_REQUEST_TIMEOUT = defineRequestSetting({
  defaultValue: 0,
  modelKey: "settingRequestTimeout",
  models: ["workspace", "folder", "http_request"],
});

export const SETTING_REQUEST_MESSAGE_SIZE = defineRequestSetting({
  defaultValue: 64 * 1024 * 1024,
  modelKey: "settingRequestMessageSize",
  models: ["workspace", "folder", "websocket_request", "grpc_request"],
});

export const SETTING_VALIDATE_CERTIFICATES = defineRequestSetting({
  defaultValue: true,
  modelKey: "settingValidateCertificates",
  models: ["workspace", "folder", "http_request", "websocket_request", "grpc_request"],
});

export const SETTING_FOLLOW_REDIRECTS = defineRequestSetting({
  defaultValue: true,
  modelKey: "settingFollowRedirects",
  models: ["workspace", "folder", "http_request"],
});

export const SETTING_HTTP_VERSION = defineRequestSetting({
  defaultValue: "auto",
  modelKey: "settingHttpVersion",
  models: ["workspace", "folder", "http_request"],
});

export const SETTING_SEND_COOKIES = defineRequestSetting({
  defaultValue: true,
  modelKey: "settingSendCookies",
  models: ["workspace", "folder", "http_request", "websocket_request"],
});

export const SETTING_STORE_COOKIES = defineRequestSetting({
  defaultValue: true,
  modelKey: "settingStoreCookies",
  models: ["workspace", "folder", "http_request", "websocket_request"],
});

export function modelSupportsSetting<K extends RequestSettingKey>(
  model: Pick<AnyModel, "model">,
  setting: RequestSettingDefinition<K>,
) {
  return setting.models.some((modelType) => modelType === model.model);
}
