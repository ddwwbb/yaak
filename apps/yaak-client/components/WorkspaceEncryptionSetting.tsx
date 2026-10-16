import {
  disableEncryption,
  enableEncryption,
  revealWorkspaceKey,
  setWorkspaceKey,
} from "@yaakapp-internal/crypto";
import type { WorkspaceMeta } from "@yaakapp-internal/models";
import { Banner, HStack, VStack } from "@yaakapp-internal/ui";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { activeWorkspaceAtom, activeWorkspaceMetaAtom } from "../hooks/useActiveWorkspace";
import { createFastMutation } from "../hooks/useFastMutation";
import { useStateWithDeps } from "../hooks/useStateWithDeps";
import { showConfirm } from "../lib/confirm";
import { useTranslation } from "../lib/i18n";
import { CopyIconButton } from "./CopyIconButton";
import type { ButtonProps } from "./core/Button";
import { Button } from "./core/Button";
import { IconButton } from "./core/IconButton";
import { IconTooltip } from "./core/IconTooltip";
import { Label } from "./core/Label";
import { PlainInput } from "./core/PlainInput";
import { SettingRow } from "./core/SettingRow";
import { EncryptionHelp } from "./EncryptionHelp";

interface Props {
  layout?: "form" | "settings";
  size?: ButtonProps["size"];
  expanded?: boolean;
  onDone?: () => void;
  onEnabledEncryption?: () => void;
}

export function WorkspaceEncryptionSetting({
  layout = "form",
  size,
  expanded,
  onDone,
  onEnabledEncryption,
}: Props) {
  const { t } = useTranslation();
  const [justEnabledEncryption, setJustEnabledEncryption] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const workspace = useAtomValue(activeWorkspaceAtom);
  const workspaceMeta = useAtomValue(activeWorkspaceMetaAtom);
  const [key, setKey] = useState<{ key: string | null; error: string | null } | null>(null);

  useEffect(() => {
    if (workspaceMeta == null) {
      return;
    }

    if (workspaceMeta?.encryptionKey == null) {
      setKey({ key: null, error: null });
      return;
    }

    revealWorkspaceKey(workspaceMeta.workspaceId).then(
      (key) => {
        setKey({ key, error: null });
      },
      (err) => {
        setKey({ key: null, error: `${err}` });
      },
    );
  }, [workspaceMeta, workspaceMeta?.encryptionKey]);

  if (key == null || workspace == null || workspaceMeta == null) {
    return null;
  }

  // Prompt for key if it doesn't exist or could not be decrypted
  if (
    key.error != null ||
    (workspace.encryptionKeyChallenge && workspaceMeta.encryptionKey == null)
  ) {
    const enterKey = (
      <EnterWorkspaceKey
        workspaceMeta={workspaceMeta}
        error={key.error}
        onEnabled={() => {
          onDone?.();
          onEnabledEncryption?.();
        }}
        onDisabled={() => {
          onDone?.();
        }}
      />
    );

    return enterKey;
  }

  // Show the key if it exists
  if (workspaceMeta.encryptionKey && key.key != null) {
    const keyRevealer = (
      <KeyRevealer
        disableLabel={justEnabledEncryption}
        defaultShow={justEnabledEncryption}
        encryptionKey={key.key}
      />
    );

    const content = (
      <VStack space={2} className="w-full">
        {justEnabledEncryption && (
          <Banner color="success" className="flex flex-col gap-2">
            <EncryptionKeyHelp />
          </Banner>
        )}
        {keyRevealer}
        {onDone && (
          <Button
            color="secondary"
            onClick={() => {
              onDone();
              onEnabledEncryption?.();
            }}
          >
            {t("common.done")}
          </Button>
        )}
      </VStack>
    );

    return content;
  }

  // Show button to enable encryption
  if (layout === "settings") {
    return (
      <>
        {error && (
          <Banner color="danger" className="mb-3">
            {t("workspaces.encryption_enable_failed", { error })}
          </Banner>
        )}
        <SettingRow
          title={t("workspaces.encryption_label")}
          description={t("workspaces.encryption_description")}
        >
          <Button
            color="secondary"
            size={size}
            onClick={async () => {
              setError(null);
              try {
                await enableEncryption(workspaceMeta.workspaceId);
                setJustEnabledEncryption(true);
              } catch (err) {
                setError(String(err));
              }
            }}
          >
            {t("workspaces.enable_encryption")}
          </Button>
        </SettingRow>
      </>
    );
  }

  return (
    <div className="mb-auto flex flex-col-reverse">
      <Button
        className="mt-3"
        color={expanded ? "info" : "secondary"}
        size={size}
        onClick={async () => {
          setError(null);
          try {
            await enableEncryption(workspaceMeta.workspaceId);
            setJustEnabledEncryption(true);
          } catch (err) {
            setError(String(err));
          }
        }}
      >
        {t("workspaces.enable_encryption")}
      </Button>
      {error && (
        <Banner color="danger" className="mb-2">
          {t("workspaces.encryption_enable_failed", { error })}
        </Banner>
      )}
      {expanded ? (
        <Banner color="info" className="mb-6">
          <EncryptionHelp />
        </Banner>
      ) : (
        <Label htmlFor={null} help={<EncryptionHelp />}>
          {t("workspaces.encryption_label")}
        </Label>
      )}
    </div>
  );
}

const setWorkspaceKeyMut = createFastMutation({
  mutationKey: ["set-workspace-key"],
  mutationFn: setWorkspaceKey,
});

function EnterWorkspaceKey({
  workspaceMeta,
  onEnabled,
  onDisabled,
  error,
}: {
  workspaceMeta: WorkspaceMeta;
  onEnabled?: () => void;
  onDisabled?: () => void;
  error?: string | null;
}) {
  const { t } = useTranslation();
  const [key, setKey] = useState<string>("");

  const handleForgotKey = async () => {
    const confirmed = await showConfirm({
      id: "disable-encryption",
      title: t("workspaces.encryption_disable"),
      color: "danger",
      confirmText: t("workspaces.encryption_disable"),
      description: (
        <>
          {t("workspaces.encryption_disable_description")}
          <br />
          <br />
          {t("workspaces.encryption_disable_irreversible")}
        </>
      ),
    });

    if (confirmed) {
      await disableEncryption(workspaceMeta.workspaceId);
      onDisabled?.();
    }
  };

  return (
    <VStack space={4} className="w-full">
      {error ? (
        <Banner color="danger">{error}</Banner>
      ) : (
        <Banner color="info">{t("workspaces.encryption_missing_key")}</Banner>
      )}
      <HStack
        as="form"
        alignItems="end"
        className="w-full"
        space={1.5}
        onSubmit={(e) => {
          e.preventDefault();
          setWorkspaceKeyMut.mutate(
            {
              workspaceId: workspaceMeta.workspaceId,
              key: key.trim(),
            },
            { onSuccess: onEnabled },
          );
        }}
      >
        <PlainInput
          required
          onChange={setKey}
          label={t("workspaces.encryption_key_label")}
          placeholder="YK0000-111111-222222-333333-444444-AAAAAA-BBBBBB-CCCCCC-DDDDDD"
        />
        <Button variant="border" type="submit" color="secondary">
          {t("common.submit")}
        </Button>
      </HStack>
      <button
        type="button"
        onClick={handleForgotKey}
        className="text-text-subtlest text-sm hover:text-text-subtle"
      >
        {t("workspaces.encryption_forgot_key")}
      </button>
    </VStack>
  );
}

function KeyRevealer({
  defaultShow = false,
  disableLabel = false,
  encryptionKey,
}: {
  defaultShow?: boolean;
  disableLabel?: boolean;
  encryptionKey: string;
}) {
  const { t } = useTranslation();
  const [show, setShow] = useStateWithDeps<boolean>(defaultShow, [defaultShow]);

  return (
    <div
      className={classNames(
        "w-full border border-border rounded-md pl-3 py-2 p-1",
        "grid gap-1 grid-cols-[minmax(0,1fr)_auto] items-center",
      )}
    >
      <VStack space={0.5}>
        {!disableLabel && (
          <span className="text-sm text-primary flex items-center gap-1">
            {t("workspaces.encryption_key_label")}{" "}
            <IconTooltip iconSize="sm" size="lg" content={<EncryptionKeyHelp />} />
          </span>
        )}
        {encryptionKey && <HighlightedKey keyText={encryptionKey} show={show} />}
      </VStack>
      <HStack>
        {encryptionKey && (
          <CopyIconButton text={encryptionKey} title={t("workspaces.encryption_copy_key")} />
        )}
        <IconButton
          title={t(show ? "workspaces.encryption_hide_key" : "workspaces.encryption_reveal_key")}
          icon={show ? "eye_closed" : "eye"}
          onClick={() => setShow((v) => !v)}
        />
      </HStack>
    </div>
  );
}

function HighlightedKey({ keyText, show }: { keyText: string; show: boolean }) {
  return (
    <span className="text-xs font-mono **:cursor-auto **:select-text">
      {show ? (
        keyText.split("").map((c, i) => {
          return (
            <span
              // oxlint-disable-next-line no-array-index-key -- it's fine
              key={i}
              className={classNames(
                c.match(/[0-9]/) && "text-info",
                c === "-" && "text-text-subtle",
              )}
            >
              {c}
            </span>
          );
        })
      ) : (
        <div className="text-text-subtle">•••••••••••••••••••••</div>
      )}
    </span>
  );
}

function EncryptionKeyHelp() {
  const { t } = useTranslation();
  return <p>{t("workspaces.encryption_key_help")}</p>;
}
