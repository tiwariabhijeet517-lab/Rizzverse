
/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";
import LiveRegistrationCount from "@/components/LiveRegistrationCount";

const highlights = [
  { icon: "♫", title: "Music", color: "text-cyan-300" },
  { icon: "♬", title: "Food", color: "text-yellow-300" },
  { icon: "🎮", title: "Games", color: "text-cyan-300" },
  { icon: "☆", title: "Cultural", color: "text-pink-400" },
  { icon: "♧", title: "Networking", color: "text-cyan-300" },
];

const benefits = [
  {
    icon: "🚀",
    title: "Meet New People",
    description: "Connect with fellow IT freshers and seniors.",
  },
  {
    icon: "☆",
    title: "Unforgettable Fun",
    description: "Music, games, food and much more.",
  },
  {
    icon: "♧",
    title: "Build Your Network",
    description: "Create bonds that last beyond college.",
  },
  {
    icon: "♛",
    title: "Be Part of Something Special",
    description: "Your college journey starts here!",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03051e] text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute -right-40 top-72 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-fuchsia-700/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(50,30,130,0.18),transparent_45%)]" />
      </div>

      {/* Navigation */}
      <header className="relative z-20 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <Link href="/" className="text-2xl font-black italic tracking-tight text-white">
          <span className="text-fuchsia-500">R</span>IZZVERSE
          <span className="align-super text-sm text-cyan-300">'26</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium sm:gap-8 sm:text-base">
          <Link href="/" className="border-b-2 border-fuchsia-500 pb-1">
            Home
          </Link>
          <a href="#about" className="transition hover:text-cyan-300">
            About
          </a>
          <a href="#events" className="transition hover:text-cyan-300">
            Events
          </a>
          <Link href="/register" className="transition hover:text-cyan-300">
            Register
          </Link>
        </nav>

        <div className="rounded-full border border-cyan-400/50 bg-blue-950/70 px-4 py-2 text-sm shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <span className="mr-2 text-cyan-300">♧</span>
          <span className="hidden sm:inline">Live Registrations</span>
          <span className="sm:hidden">Live</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-10 lg:grid-cols-2 lg:pt-20">
        <div className="relative text-center lg:text-left">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-cyan-300 sm:text-base">
            IT Department
          </p>
          <p className="mb-5 text-lg font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
            Freshers' Party
          </p>

          <h1 className="relative text-6xl font-black italic leading-[0.95] tracking-tighter sm:text-7xl md:text-8xl lg:text-8xl">
            <span className="block bg-gradient-to-b from-cyan-200 via-blue-400 to-fuchsia-600 bg-clip-text text-transparent [text-shadow:0_5px_0_rgba(80,20,180,0.6)]">
              RIZZVERSE
            </span>
            <span className="mt-2 block bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300 bg-clip-text text-5xl text-transparent sm:text-6xl">
              '26
            </span>
          </h1>

          <div className="mx-auto my-7 h-1 w-40 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-400 shadow-[0_0_20px_#a855f7] lg:mx-0" />

          <p className="text-2xl font-semibold italic text-white sm:text-3xl">
            Step In, Stand Out.
          </p>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-300 sm:text-lg lg:mx-0">
            Get ready for an unforgettable celebration of music, friendship,
            creativity, and new beginnings.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="min-w-20 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-cyan-400/10"
              >
                <div className={`text-2xl ${item.color}`}>{item.icon}</div>
                <p className="mt-1 text-xs font-medium text-slate-200">
                  {item.title}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-cyan-200/60 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-500 px-9 py-4 text-lg font-extrabold shadow-[0_0_30px_rgba(168,85,247,0.45)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_45px_rgba(34,211,238,0.5)]"
            >
              Register Now
              <span className="text-2xl transition group-hover:translate-x-1">
                →
              </span>
            </Link>
            <div className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-6 py-3 text-center">
              <span className="text-xs uppercase tracking-widest text-cyan-200">
                Entry Fee
              </span>
              <p className="text-xl font-black text-white">₹1,400</p>
              <p className="text-xs text-slate-300">per student</p>
            </div>
          </div>
        </div>

        {/* Poster */}
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-purple-700 opacity-60 blur-xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/70 bg-[#10103c] p-2 shadow-[0_0_45px_rgba(34,211,238,0.25)] transition duration-500 hover:-translate-y-2 hover:rotate-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-blue-950">
              <Image
                src="/poster.png"
                alt="RIZZVERSE'26 IT Freshers' Party poster"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="absolute -right-5 -top-6 animate-bounce rounded-2xl border border-yellow-300/60 bg-yellow-400/10 px-4 py-3 text-3xl shadow-[0_0_25px_rgba(250,204,21,0.2)]">
            ♛
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-full border border-fuchsia-300/60 bg-fuchsia-500/20 px-5 py-3 text-2xl shadow-[0_0_25px_rgba(217,70,239,0.3)]">
            ✦
          </div>
        </div>
      </section>

      {/* Live registration */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-blue-950/80 via-purple-950/70 to-fuchsia-950/70 p-5 text-center shadow-[0_0_30px_rgba(34,211,238,0.1)] backdrop-blur-xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Join the celebration
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <span className="text-lg font-bold">Students registered:</span>
            <div className="rounded-xl border border-cyan-300/30 bg-black/30 px-4 py-2 text-2xl font-black text-cyan-300">
              <LiveRegistrationCount />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.4em] text-cyan-300">
            Why Join
          </p>
          <h2 className="text-3xl font-black uppercase tracking-wide sm:text-5xl">
            <span className="bg-gradient-to-r from-fuchsia-400 via-white to-cyan-300 bg-clip-text text-transparent">
              RIZZVERSE'26
            </span>
          </h2>
          <div className="mx-auto mt-5 h-1 w-28 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-blue-950/70 to-[#080a2b] p-6 text-center shadow-[0_0_20px_rgba(34,211,238,0.06)] transition duration-300 hover:-translate-y-2 hover:border-fuchsia-400/70 hover:shadow-[0_0_30px_rgba(217,70,239,0.2)]"
            >
              <div className="mb-4 text-4xl transition duration-300 group-hover:scale-125 group-hover:rotate-6">
                {item.icon}
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-6 text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Register banner */}
      <section id="events" className="relative z-10 mx-auto max-w-5xl px-6 py-16 text-center">
        <div className="rounded-3xl border border-fuchsia-400/40 bg-gradient-to-r from-purple-950/80 via-blue-950/80 to-fuchsia-950/80 p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)] sm:p-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
            Your journey starts here
          </p>
          <h2 className="text-3xl font-black sm:text-5xl">
            Ready to Enter the RIZZVERSE?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Register now and be part of the IT Department's freshers'
            celebration.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-10 py-4 text-lg font-extrabold shadow-[0_0_30px_rgba(217,70,239,0.35)] transition hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          >
            Register Now <span className="text-2xl">→</span>
          </Link>
        </div>
      </section>

      
{/* Footer */}
<footer className="relative z-10 border-t border-cyan-400/20 px-6 py-8 text-center">
  <p className="text-lg font-black tracking-[0.3em] text-cyan-200">
    RIZZVERSE'26
  </p>

  <p className="mt-2 text-sm text-slate-400">
    IT Department · Freshers' Party
  </p>

  <div className="mt-5 space-y-2">
    <p className="text-sm font-semibold text-white">
      Department:{" "}
      <span className="text-cyan-300">
        Information Technology
      </span>
    </p>

    <p className="text-sm font-semibold text-white">
      Developer:{" "}
      <span className="text-fuchsia-300">
        Abhijeet Tiwari
      </span>
    </p>
  </div>

  <p className="mt-5 text-sm italic text-fuchsia-300">
    Same Team, Bigger Dreams.
  </p>

  <p className="mt-4 text-xs tracking-wider text-slate-500">
    © 2026 RIZZVERSE'26 · All Rights Reserved
  </p>
</footer>


    </main>
  );
}

