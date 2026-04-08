import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-24">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-zinc-900">
          Nobu Workforce Platform 🍣
        </h1>
        <p className="mb-8 text-zinc-500">
          Frontend prototype is running and ready to use.
        </p>

        <Link href="/login">
          <Button size="lg">
            Go to Sign In
          </Button>
        </Link>
      </main>
  );
}