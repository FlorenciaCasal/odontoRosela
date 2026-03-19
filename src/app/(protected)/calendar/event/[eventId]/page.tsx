import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import CalendarEventSearchBox from "@/app/components/CalendarEventSearchBox";
import CalendarEventResolutionActions from "@/app/components/CalendarEventResolutionActions";
import LinkCalendarEventPatientButton from "@/app/components/LinkCalendarEventPatientButton";
import { getCurrentAuthenticatedUser } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import {
  getCalendarEventLinkByEventId,
  getStrongCalendarEventPatientSuggestion,
  normalizeGoogleEventId,
  searchPatientsForResolution,
} from "@/lib/calendar-events";

function formatDate(value?: Date | null) {
  if (!value) return "Sin fecha registrada";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(value);
}

const STATUS_LABELS: Record<string, string> = {
  linked: "Vinculado",
  pending_review: "Pendiente de revisión",
  ambiguous: "Ambiguo",
  unlinked: "Sin vínculo",
  ignored: "Ignorado",
};

export default async function CalendarEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const auth = await getCurrentAuthenticatedUser();
  if (!auth) {
    redirect("/login");
  }

  const { eventId: rawEventId } = await params;
  const { q = "" } = await searchParams;
  const eventId = normalizeGoogleEventId(rawEventId);
  const link = await getCalendarEventLinkByEventId(eventId);
  const suggestedMatch =
    !link?.patientId && link?.eventTitleSnapshot
      ? await getStrongCalendarEventPatientSuggestion(link.eventTitleSnapshot)
      : null;

  await logAudit({
    actorUserId: auth.user.id,
    action: "calendar_event_opened",
    entityType: "calendar_event",
    entityId: eventId,
    patientId: link?.patientId ?? null,
    calendarEventLinkId: link?.id ?? null,
    metadata: { status: link?.status ?? "missing" },
  });

  if (link?.status === "linked" && link.patientId) {
    await logAudit({
      actorUserId: auth.user.id,
      action: "calendar_event_redirected_to_patient",
      entityType: "calendar_event",
      entityId: eventId,
      patientId: link.patientId,
      calendarEventLinkId: link.id,
    });

    redirect(`/patients/${link.patientId}`);
  }

  const results = q.trim() ? await searchPatientsForResolution(q) : [];
  const status = link?.status ?? "pending_review";

  return (
    <AppShell
      title="Resolver evento"
      subtitle="Acceso seguro desde Google Calendar"
      right={<Link href="/patients" className="btn">Pacientes</Link>}
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card p-5 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Estado del vínculo</h2>
            <p className="text-sm muted mt-1">
              Este evento no abre una ficha automáticamente hasta que exista un vínculo explícito.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2">
            <div><span className="font-medium">Estado:</span> {STATUS_LABELS[status] ?? status}</div>
            <div><span className="font-medium">Event ID:</span> <span className="break-all">{eventId}</span></div>
            {link?.eventTitleSnapshot ? (
              <div><span className="font-medium">Título:</span> {link.eventTitleSnapshot}</div>
            ) : null}
            <div><span className="font-medium">Inicio:</span> {formatDate(link?.eventStartAt ?? null)}</div>
            <div><span className="font-medium">Fin:</span> {formatDate(link?.eventEndAt ?? null)}</div>
            {typeof link?.matchConfidence === "number" ? (
              <div><span className="font-medium">Confianza previa:</span> {link.matchConfidence}%</div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Buscar paciente</h3>
              <p className="text-xs muted mt-1">
                Buscá por nombre o DNI y vinculá manualmente el evento al paciente correcto.
              </p>
            </div>
            {suggestedMatch ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-900">
                  Sugerencia fuerte disponible
                </div>
                <div className="mt-1 text-sm text-emerald-950">
                  Vincular con {suggestedMatch.patient.fullName}
                  {suggestedMatch.patient.docNumber ? ` (DNI ${suggestedMatch.patient.docNumber})` : ""}
                </div>
                <div className="mt-1 text-xs text-emerald-800">
                  {suggestedMatch.reason === "dni_exact"
                    ? "Coincidencia exacta por DNI detectado en el titulo del evento."
                    : "Coincidencia unica fuerte por el titulo del evento."}
                </div>
                <div className="mt-3">
                  <LinkCalendarEventPatientButton
                    eventId={eventId}
                    patientId={suggestedMatch.patient.id}
                  />
                </div>
              </div>
            ) : null}
            <CalendarEventSearchBox />
          </div>

          {q.trim() ? (
            <div className="space-y-3">
              {results.length > 0 ? (
                <ul className="space-y-3">
                  {results.map((patient) => (
                    <li key={patient.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900">{patient.fullName}</div>
                          <div className="text-sm muted">
                            {patient.docNumber ? `DNI: ${patient.docNumber}` : "Sin DNI"}
                            {patient.phone ? ` · Tel: ${patient.phone}` : ""}
                            {patient.email ? ` · ${patient.email}` : ""}
                          </div>
                        </div>
                        <LinkCalendarEventPatientButton eventId={eventId} patientId={patient.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm muted">
                  No encontramos pacientes para esa búsqueda.
                </div>
              )}
            </div>
          ) : null}
        </section>

        <section className="card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Acciones seguras</h3>
            <p className="text-xs muted mt-1">
              Elegí una acción explícita. No se va a abrir ninguna ficha por inferencia silenciosa.
            </p>
          </div>

          <CalendarEventResolutionActions eventId={eventId} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/dashboard" className="btn w-full sm:w-auto">Ir al dashboard</Link>
            <Link href="/patients" className="btn w-full sm:w-auto">Abrir pacientes</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
