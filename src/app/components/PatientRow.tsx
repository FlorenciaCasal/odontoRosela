"use client"
import Link from "next/link";
import { useState } from "react";
import formatName from "@/utils/formatName";
import EditPatientInline from "./EditPatientInline";
import DeletePatientButton from "./DeletePatientButton";
import type { InferSelectModel } from "drizzle-orm";
import { patients } from "@/lib/schema";

export type Patient = InferSelectModel<typeof patients>;

export default function PatientRow({ p }: { p: Patient }) {
  const [editing, setEditing] = useState(false);

  const secondary = [
    p.docNumber ? `DNI: ${p.docNumber}` : null,
    p.phone ? `Tel: ${p.phone}` : null,
  ].filter(Boolean);

  return (
    <li className="card p-2 sm:p-4">
      <div
        className={`
          flex gap-3 justify-between
          ${editing ? "flex-col" : "flex-row items-center"}
          sm:flex-row sm:items-center
        `}
      >
        {/* Left */}
        <div className="min-w-0">
          <Link
            href={`/patients/${p.id}`}
            className="block truncate text-base sm:text-lg font-semibold text-strong hover:underline"
          >
            {formatName(p.fullName) || "-"}
          </Link>

          {secondary.length ? (
            <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-muted">
              {secondary.map((t, i) => (
                <span key={i} className="whitespace-nowrap">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-sm text-muted">
              Sin datos de contacto
            </div>
          )}
        </div>

        {/* Right / Actions */}
        <div className="flex flex-col items-end gap-2 sm:gap-3 w-full sm:w-auto">
          <EditPatientInline
            p={p}
            onEditingChange={setEditing}
          />
          {!editing && (
            <DeletePatientButton id={p.id} name={p.fullName} />
          )}
        </div>
      </div>
    </li>
  );
}
