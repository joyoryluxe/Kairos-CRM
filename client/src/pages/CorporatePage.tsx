import { Building2, Phone, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  deleteCorporateEvent,
  getCorporateEvents,
  type CorporateEvent,
} from "@/api/corporateEvents";

export default function CorporatePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["corporate-events"],
    queryFn: getCorporateEvents,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCorporateEvent(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["corporate-events"] }); },
  });

  return (
    <div className="animate-fade-up">
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
            <Building2 size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Corporate &amp; Events</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: "0.25rem 0 0 0" }}>
              Organize corporate client accounts, large event schedules, and B2B contracts.
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard/corporate/new")} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={20} /> Add Event
        </button>
      </header>

      <div className="card" style={{ padding: "1.25rem", backgroundColor: "var(--bg-surface-2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {isLoading ? "Loading..." : `Records: ${data?.length ?? 0}`}
            {isFetching && !isLoading ? " (refreshing)" : ""}
          </div>
          <button className="btn" onClick={() => refetch()} disabled={isLoading || isFetching}>
            Refresh
          </button>
        </div>

        {isError ? (
          <div style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Failed to load corporate/events records</div>
            <div style={{ color: "var(--text-muted)" }}>{(error as Error)?.message ?? "Unknown error"}</div>
          </div>
        ) : isLoading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Fetching corporate/events data…</div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {(data ?? []).map((eItem: CorporateEvent) => (
              <div
                key={eItem._id}
                style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontWeight: 650, fontSize: "1.1rem" }}>{eItem.clientName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Phone size={14} /> {eItem.phoneNumber}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Calendar size={14} />
                      {eItem.eventName ? `Event: ${eItem.eventName}` : "Event: —"} ·{" "}
                      {eItem.eventDateAndTime ? new Date(eItem.eventDateAndTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Date: —"}
                    </div>
                    {eItem.package && (
                      <div style={{ color: "var(--color-primary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Package: {eItem.package}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className="btn" onClick={() => navigate(`/dashboard/corporate/${eItem._id}/edit`)} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Edit size={16} /> Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => deleteMutation.mutate(eItem._id)} disabled={deleteMutation.isPending} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
