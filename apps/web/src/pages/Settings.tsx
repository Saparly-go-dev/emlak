import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@mekan/contracts";
import { api } from "../api";
import { useI18n } from "../i18n";
import { Heading } from "../components/Layout";
import { Field, ErrorMessage } from "../components/ui";
export function Settings() {
  const { t } = useI18n(),
    cache = useQueryClient();
  const mutation = useMutation({
    mutationFn: (body: Record<string, FormDataEntryValue>) =>
      api<Session>("/auth/password", { method: "POST", body }),
    onSuccess: (data) => cache.setQueryData(["session"], data),
  });
  return (
    <>
      <Heading title="settings" />
      <section className="panel settings-panel">
        <h2>{t("changePassword")}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            mutation.mutate(Object.fromEntries(new FormData(form)), {
              onSuccess: () => form.reset(),
            });
          }}
        >
          <Field
            name="currentPassword"
            label={t("currentPassword")}
            type="password"
            required
            autoComplete="current-password"
            maxLength={128}
          />
          <Field
            name="newPassword"
            label={t("newPassword")}
            type="password"
            required
            minLength={10}
            maxLength={128}
            autoComplete="new-password"
            hint={t("passwordHint")}
          />
          <ErrorMessage error={mutation.error} />
          {mutation.isSuccess && <p role="status">{t("passwordChanged")}</p>}
          <div className="modal-actions">
            <button className="button primary" disabled={mutation.isPending}>
              {t("save")}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
