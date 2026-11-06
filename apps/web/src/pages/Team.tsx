import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import type { Page, User } from "@mekan/contracts";
import { api } from "../api";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { Heading } from "../components/Layout";
import {
  Modal,
  Field,
  Select,
  ErrorMessage,
  Loading,
  Pagination,
  Pill,
} from "../components/ui";
export function Team() {
  const { user } = useAuth(),
    { t } = useI18n(),
    [page, setPage] = useState(1),
    [editing, setEditing] = useState<User | "new" | null>(null);
  const query = useQuery({
    queryKey: ["users", page],
    queryFn: ({ signal }) => api<Page<User>>("/users?page=" + page, { signal }),
    enabled: user.role === "admin",
  });
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return (
    <>
      <Heading title="team" hint="teamHint">
        <button className="button primary" onClick={() => setEditing("new")}>
          + {t("addUser")}
        </button>
      </Heading>
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorMessage error={query.error} />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {["name", "email", "role", "status"].map((k) => (
                    <th key={k}>{t(k)}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {query.data?.items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{t(u.role)}</td>
                    <td>
                      <Pill value={u.active ? "active" : "inactive"} />
                    </td>
                    <td>
                      <button
                        className="button small"
                        onClick={() => setEditing(u)}
                      >
                        {t("edit")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {query.data && <Pagination {...query.data} onPage={setPage} />}
        </>
      )}
      {editing && (
        <Modal
          title={t(editing === "new" ? "addUser" : "edit")}
          onClose={() => setEditing(null)}
        >
          <UserForm
            user={editing === "new" ? undefined : editing}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </>
  );
}
function UserForm({ user, onClose }: { user?: User; onClose: () => void }) {
  const { t } = useI18n(),
    cache = useQueryClient(),
    [role, setRole] = useState(user?.role || "agent"),
    [active, setActive] = useState(user?.active ?? true);
  const mutation = useMutation({
    mutationFn: (data: Record<string, FormDataEntryValue>) =>
      api("/users" + (user ? "/" + user.id : ""), {
        method: user ? "PUT" : "POST",
        body: {
          ...data,
          role,
          ...(user ? { active, version: user.version } : {}),
        },
      }),
    onSuccess: () => {
      onClose();
      cache.invalidateQueries({ queryKey: ["users"] });
      cache.invalidateQueries({ queryKey: ["audit"] });
      cache.invalidateQueries({ queryKey: ["session"] });
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(Object.fromEntries(new FormData(e.currentTarget)));
      }}
    >
      <div className="form-grid">
        <Field
          label={t("name")}
          name="name"
          defaultValue={user?.name}
          required
          maxLength={160}
        />
        {!user && (
          <>
            <Field
              label={t("email")}
              name="email"
              type="email"
              required
              maxLength={254}
            />
            <Field
              label={t("password")}
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={10}
              maxLength={128}
            />
          </>
        )}
        <Select
          label={t("role")}
          value={role}
          onChange={(v) => setRole(v as User["role"])}
          options={["agent", "admin"].map((v) => [v, t(v)])}
        />
        {user && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            {t("activeAccount")}
          </label>
        )}
      </div>
      <ErrorMessage error={mutation.error} />
      <div className="modal-actions">
        <button type="button" className="button" onClick={onClose}>
          {t("cancel")}
        </button>
        <button disabled={mutation.isPending} className="button primary">
          {t("save")}
        </button>
      </div>
    </form>
  );
}
