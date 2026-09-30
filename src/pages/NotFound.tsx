import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="vv-bg flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
      <KeyRound className="size-10 text-gold-500/60" />
      <h1 className="font-display text-4xl text-gold-200">This door leads nowhere</h1>
      <p className="max-w-sm font-body text-amber-100/70">
        The corridor you followed does not exist in the house's plans. Every
        other one does — more or less.
      </p>
      <Button asChild className="bg-gold-600 font-body text-black hover:bg-gold-500">
        <Link to="/">Back to the foyer</Link>
      </Button>
    </main>
  );
}
