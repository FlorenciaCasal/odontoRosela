import NewVisitForm from "./form-client";

export default async function NewVisit({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  if (!patientId) {
    return <main className="p-6">Falta el parámetro <code>patientId</code></main>;
  }
  return <NewVisitForm patientId={patientId} />;
}




