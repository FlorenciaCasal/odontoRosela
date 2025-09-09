"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PatientsSearchBox() {
    const sp = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const initial = sp.get("q") ?? "";
    const [q, setQ] = useState(initial);

    useEffect(() => { setQ(initial); }, [initial]);

    // debounce 250ms
    useEffect(() => {
        const t = setTimeout(() => {
            const p = new URLSearchParams(sp.toString());
            if (q) p.set("q", q); else p.delete("q");
            router.replace(`${pathname}?${p.toString()}`, { scroll: false });
        }, 250);
        return () => clearTimeout(t);
    }, [q, pathname, router, sp]);

    return (
        <input
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o DNI"
            className="border p-2 rounded w-full"
            autoFocus
        />
    );
}
