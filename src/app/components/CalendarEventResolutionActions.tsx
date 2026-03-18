"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  eventId: string;
};

export default function CalendarEventResolutionActions({ eventId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<"ignore" | null>(null);

  async function ignoreEvent() {
    setPending("ignore");
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "ignore" }),
      });

      if (!res.ok) {
        alert("No se pudo marcar el evento como ignorado");
        return;
      }

      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={ignoreEvent}
        disabled={pending === "ignore"}
        className="btn w-full sm:w-auto"
      >
        {pending === "ignore" ? "Guardando..." : "Marcar como ignorado"}
      </button>
    </div>
  );
}
