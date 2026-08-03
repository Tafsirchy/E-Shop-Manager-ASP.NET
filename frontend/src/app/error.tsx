"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-xl rounded-3xl border border-border bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">Something went wrong</p>
          <h1 className="mt-3 text-2xl font-bold text-foreground">We could not load this page.</h1>
          <p className="mt-3 text-sm text-neutral-600">{error.message}</p>
          <button onClick={reset} className="mt-6 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
