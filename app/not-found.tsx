import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <p className="font-body text-xs uppercase tracking-[0.35em] text-accent">
        nothing here yet
      </p>
      <h1 className="mt-6 max-w-2xl font-display text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tightest">
        Every page here is built from a week. This one doesn&apos;t have one.
      </h1>
      <Link
        href="/"
        className="mt-10 font-body text-sm uppercase tracking-[0.25em] text-accent underline-offset-4 hover:underline"
        data-cursor="hover"
      >
        Start from your week →
      </Link>
    </main>
  );
}
