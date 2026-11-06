import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import type { Page, AuditEntry } from "@mekan/contracts";
import { api } from "../api";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { Heading } from "../components/Layout";
import {
  ErrorMessage,
  Loading,
  Pagination,
  useFormats,
} from "../components/ui";
export function Audit() {
  const { user } = useAuth(),
    { t } = useI18n(),
    { date } = useFormats(),
    [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["audit", page],
    queryFn: ({ signal }) =>
      api<Page<AuditEntry>>("/audit?page=" + page, { signal }),
    enabled: user.role === "admin",
  });
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return (
    <>
      <Heading title="audit" hint="auditHint" />
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorMessage error={query.error} />
      ) : (
        query.data && (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[
                      "createdAt",
                      "actorName",
                      "action",
                      "entity",
                      "recordId",
                    ].map((k) => (
                      <th key={k}>{t(k)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((item) => (
                    <tr key={item.id}>
                      <td>{date(item.createdAt)}</td>
                      <td>{item.actorName}</td>
                      <td>{t(item.action)}</td>
                      <td>
                        {t(item.entity === "users" ? "team" : item.entity)}
                      </td>
                      <td>#{item.recordId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination {...query.data} onPage={setPage} />
          </>
        )
      )}
    </>
  );
}
