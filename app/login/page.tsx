import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <div className="absolute left-8 top-8 hidden text-xs font-semibold uppercase tracking-[0.28em] text-[#756f63] md:block">
        Smart RFID Locker
      </div>

      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-black/10 bg-[#fff8eb]/75 shadow-[0_30px_100px_rgba(44,34,18,0.18)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[520px] overflow-hidden bg-[#201a12] p-8 text-[#fff8eb] md:p-12">
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 28% 22%, rgba(199,111,55,.52), transparent 22rem), radial-gradient(circle at 72% 72%, rgba(47,125,87,.42), transparent 24rem)" }} />
          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full border border-white/20" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              MVP Development · June 2026
            </div>

            <div className="max-w-md space-y-6">
              <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-6xl">
                Monitor loker tanpa cek fisik.
              </h1>
              <p className="max-w-sm text-base leading-7 text-white/70">
                RFID mengenali pemilik, load cell membaca keberadaan barang, dashboard menerima update real-time dari Supabase.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-white/45">Latency</p>
                <p className="mt-1 font-display text-2xl font-semibold">&lt;3s</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-white/45">Access</p>
                <p className="mt-1 font-display text-2xl font-semibold">RFID</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-white/45">Sensor</p>
                <p className="mt-1 font-display text-2xl font-semibold">HX711</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center p-6 md:p-10">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
