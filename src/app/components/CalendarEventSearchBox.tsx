"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CalendarEventSearchBox() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initial = sp.get("q") ?? "";
  const [q, setQ] = useState(initial);

  useEffect(() => {
    setQ(initial);
  }, [initial]);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }, 250);

    return () => clearTimeout(t);
  }, [pathname, q, router, sp]);

  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="Buscar paciente por nombre o DNI"
      className="input"
      autoFocus
    />
  );
}
