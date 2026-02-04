import NewVisitForm from "./form-client";
import { notFound } from "next/navigation";

export default async function NewVisit({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  if (!patientId) notFound();

  return <NewVisitForm patientId={patientId} />;
}






