"use client";
import React from "react";

type Props = {
  children: React.ReactNode;        // el <Icon />
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "subtle" | "danger" | "ghost";
  size?: "sm" | "md";
  title?: string;                   // tooltip
  "aria-label": string;            // texto accesible
  className?: string;
  disabled?: boolean;
};

function cx(...c: Array<string | false | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function IconButton({
  children, onClick, type = "button",
  variant = "subtle", size = "md",
  title, className, disabled, ...a11y
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-lg border transition " +
    "focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "h-8 w-8 p-1.5",
    md: "h-9 w-9 p-2",
  }[size];

  const variants = {
    primary: "bg-black text-white border-black hover:bg-neutral-900 focus-visible:ring-black",
    subtle:  "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50 focus-visible:ring-neutral-300",
    danger:  "bg-white text-red-700 border-red-200 hover:bg-red-50 focus-visible:ring-red-300",
    ghost:   "bg-transparent text-neutral-900 border-transparent hover:bg-neutral-100 focus-visible:ring-neutral-300",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cx(base, sizes, variants, className)}
      {...a11y}
    >
      {children}
    </button>
  );
}
