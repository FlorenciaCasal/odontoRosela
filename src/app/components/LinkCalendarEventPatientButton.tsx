"use client";

import { useState } from "react";

type Props = {
  eventId: string;
  patientId: string;
};

export default function LinkCalendarEventPatientButton({ eventId, patientId }: Props) {
  const [pending, setPending] = useState(false);

  async function handleLink() {
    setPending(true);
    try {
      const res = await fetch(`/api/calendar/events/${encodeURIComponent(eventId)}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution: "link_existing",
          patientId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.redirectTo) {
        alert(data?.error ?? "No se pudo vincular el evento");
        return;
      }

      location.href = data.redirectTo;
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLink}
      disabled={pending}
      className="btn-primary w-full sm:w-auto"
    >
      {pending ? "Vinculando..." : "Vincular"}
    </button>
  );
}
