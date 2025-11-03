export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-900">
      <main className="flex flex-col items-center gap-8 px-8 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Welcome to Your App
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          This is a Next.js boilerplate. Start building your application by editing{" "}
          <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-sm dark:bg-zinc-800">
            app/page.tsx
          </code>
        </p>
        {/* TODO: Add your application content here */}
      </main>
    </div>
  );
}
