"use client";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "subtle" | "danger" | "ghost";
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
};

function cx(...cls: Array<string | false | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function MinimalButton({
  children,
  onClick,
  type = "button",
  variant = "subtle",
  size = "md",
  className,
  disabled,
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl border transition " +
    "focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-3.5 py-2 text-sm",
  }[size];

  const variants = {
    primary:
      "bg-black text-white border-black hover:bg-neutral-900 " +
      "focus-visible:ring-black",
    subtle:
      "bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50 " +
      "focus-visible:ring-neutral-300",
    danger:
      "bg-white text-red-700 border-red-200 hover:bg-red-50 " +
      "focus-visible:ring-red-300",
    ghost:
      "bg-transparent text-neutral-900 border-transparent hover:bg-neutral-100 " +
      "focus-visible:ring-neutral-300",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(base, sizes, variants, className)}
    >
      {children}
    </button>
  );
}
