export default function Terms() {
  return (
    <main className="w-full flex flex-col items-center pb-16 p-6 sm:p-8 gap-16 *:sm:px-8 *:px-4">
      <section className="flex flex-col gap-2 items-center text-center max-w-3x pt-16">
        <h1 className="text-[3.75rem] md:text-[6rem] leading-[0.95] font-black tracking-tighter">
          Terms and Conditions
        </h1>
        <div className="h-1 w-24 bg-primary mt-8 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
        <p className="text-lg md:text-xl text-on-surface-variant font-body mt-4">
          Last Updated: April 22, 2026
        </p>
      </section>
      <section className="bg-bg-card rounded-lg p-8 md:p-16 shadow-2xl border border-primary/10 max-w-7xl flex flex-col gap-12 relative overflow-hidden backdrop-blur-sm">
        <article className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-[1.875rem] font-bold font-headline">
              1. Agreement to Terms
            </h2>
          </div>
          <p className="text-lg text-slate-400 font-body leading-relaxed">
            By accessing or using Rahiq, you agree to be bound by these Terms
            and Conditions. If you disagree with any part of the terms, you may
            not access the service. These terms constitute a legally binding
            agreement made between you and Rahiq.
          </p>
        </article>
        <hr className="border-t border-primary/20" />
        <article className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-[1.875rem] font-bold">2. Educational Use</h2>
          </div>
          <p className="text-lg text-slate-400 font-body leading-relaxed">
            The materials provided on this platform are for educational and
            spiritual growth purposes. You are granted a limited, non-exclusive,
            non-transferable license to access and use the curriculum for
            personal, non-commercial use.
          </p>
          <ul className="list-disc list-inside text-lg text-slate-400 font-body leading-relaxed ml-4 mt-2 space-y-2">
            <li>Do not redistribute materials without explicit permission.</li>
            <li>
              Maintain respect for the sacred nature of the texts provided.
            </li>
            <li>
              Account sharing is strictly prohibited and may result in
              termination.
            </li>
          </ul>
        </article>
        <hr className="border-t border-primary/20" />
        <article className="flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-[1.875rem] font-bold">3. User Conduct</h2>
          </div>
          <p className="text-lg text-slate-400 font-body leading-relaxed">
            Users are expected to conduct themselves with adab (etiquette)
            within community forums and live sessions. Harassment, hate speech,
            or disruptive behavior will lead to immediate account suspension.
          </p>
        </article>
      </section>
    </main>
  );
}
