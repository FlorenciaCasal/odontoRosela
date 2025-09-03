import NewVisitForm from "./form-client";

export default async function NewVisit({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  return <NewVisitForm patientId={patientId!} />;
}



