import { Building2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCorporateEvent,
  deleteCorporateEvent,
  getCorporateEvents,
  updateCorporateEvent,
  type CorporateEvent,
  type CorporateEventInput,
} from "@/api/corporateEvents";

export default function CorporatePage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CorporateEventInput>({
    clientName: "",
    phoneNumber: "",
    eventName: "",
  });
  const [editing, setEditing] = useState<CorporateEvent | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["corporate-events"],
    queryFn: getCorporateEvents,
  });

  const createMutation = useMutation({
    mutationFn: createCorporateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-events"] });
      setForm({
        clientName: "",
        phoneNumber: "",
        eventName: "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CorporateEventInput> }) =>
      updateCorporateEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-events"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCorporateEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-events"] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({
        id: editing._id,
        payload: {
          clientName: form.clientName,
          phoneNumber: form.phoneNumber,
          eventName: form.eventName,
        },
      });
    } else {
      createMutation.mutate({
        clientName: form.clientName,
        phoneNumber: form.phoneNumber,
        eventName: form.eventName,
      });
    }
  };

  const startEdit = (eItem: CorporateEvent) => {
    setEditing(eItem);
    setForm({
      clientName: eItem.clientName,
      phoneNumber: eItem.phoneNumber,
      eventName: eItem.eventName ?? "",
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      clientName: "",
      phoneNumber: "",
      eventName: "",
    });
  };

  return (
    <div className="animate-fade-up">
      <header style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <div style={{ padding: "0.6rem", backgroundColor: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "var(--radius-md)" }}>
            <Building2 size={24} />
          </div>
          <h1 style={{ fontSize: "1.8rem", margin: 0 }}>Corporate & Events</h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Organize corporate client accounts, large event schedules, and B2B contracts.
        </p>
      </header>

      <div className="card" style={{ padding: "1.25rem", backgroundColor: "var(--bg-surface-2)", marginBottom: "1.25rem" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "flex-end" }}
        >
          <div style={{ minWidth: 180, flex: "1 1 180px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: 4 }}>Client name</label>
            <input
              required
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              placeholder="Client name"
            />
          </div>
          <div style={{ minWidth: 150, flex: "1 1 150px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: 4 }}>Phone</label>
            <input
              required
              value={form.phoneNumber}
              onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
              placeholder="Phone number"
            />
          </div>
          <div style={{ minWidth: 180, flex: "1 1 180px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", marginBottom: 4 }}>Event name</label>
            <input
              value={form.eventName}
              onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
              placeholder="Event name"
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? "Update record" : "Add record"}
            </button>
            {editing && (
              <button type="button" className="btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {(createMutation.isError || updateMutation.isError) && (
          <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--color-danger)" }}>
            {(createMutation.error as Error | null)?.message ||
              (updateMutation.error as Error | null)?.message ||
              "Failed to save record"}
          </div>
        )}
      </div>

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
            {(data ?? []).map((eItem) => (
              <div
                key={eItem._id}
                style={{
                  padding: "1rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 650 }}>{eItem.clientName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{eItem.phoneNumber}</div>
                    <div style={{ marginTop: "0.25rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {eItem.eventName ? `Event: ${eItem.eventName}` : "Event: —"} ·{" "}
                      {eItem.eventDateAndTime
                        ? `When: ${new Date(eItem.eventDateAndTime).toLocaleString()}`
                        : "When: —"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" className="btn" onClick={() => startEdit(eItem)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => deleteMutation.mutate(eItem._id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
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
