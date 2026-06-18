export default function Loading() {
  return (
    <>
      <section className="bg-gradient-to-b from-nail-cream to-white px-4 py-20">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <div className="mx-auto h-12 w-64 animate-pulse rounded-lg bg-nail-pink/40" />
          <div className="mx-auto h-6 w-80 animate-pulse rounded-lg bg-nail-pink/30" />
          <div className="mx-auto h-5 w-96 animate-pulse rounded-lg bg-nail-pink/20" />
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-nail-pink/30 bg-white"
              >
                <div className="aspect-[16/10] animate-pulse bg-nail-pink/30" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-nail-pink/30" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-nail-pink/40" />
                  <div className="h-4 w-full animate-pulse rounded bg-nail-pink/20" />
                  <div className="h-8 w-1/3 animate-pulse rounded bg-nail-pink/30" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
