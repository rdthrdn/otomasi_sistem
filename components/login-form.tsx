"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-8">
      <div className="space-y-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#201a12] text-[#fff8eb]">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[#201a12]">Masuk dashboard</h2>
          <p className="mt-2 text-sm leading-6 text-[#756f63]">
            Gunakan akun admin Supabase Auth untuk memantau status loker dan riwayat akses RFID.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#4d463b]">Email admin</span>
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@kampus.ac.id" required />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#4d463b]">Password</span>
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#b94a3f]/20 bg-[#b94a3f]/10 px-4 py-3 text-sm text-[#963a31]">
          {error}
        </div>
      ) : null}

      <Button className="w-full" disabled={loading}>
        {loading ? "Memeriksa akses..." : "Masuk"}
      </Button>

      <p className="text-xs leading-5 text-[#756f63]">
        Belum punya admin? Buat user melalui Supabase Dashboard → Authentication → Users.
      </p>
    </form>
  );
}
