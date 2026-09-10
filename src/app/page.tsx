export default function Home() {
  return (
    <main className="bg-wedding-cream text-wedding-navy relative flex min-h-svh items-center justify-center overflow-hidden px-6 py-20 sm:px-10">
      <div
        aria-hidden="true"
        className="bg-wedding-navy absolute inset-x-0 top-0 h-2"
      />

      <div
        aria-hidden="true"
        className="bg-wedding-blue absolute top-12 left-6 h-px w-16 sm:left-10 sm:w-24"
      />

      <section
        aria-labelledby="wedding-heading"
        className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center"
      >
        <p className="mb-8 text-xs font-semibold uppercase sm:text-sm">
          With love and joy
        </p>

        <h1
          id="wedding-heading"
          aria-label="Felix & Gift"
          className="font-serif text-6xl leading-none font-normal tracking-[0] sm:text-7xl md:text-8xl"
        >
          <span className="block">Felix</span>
          <span className="text-wedding-brown my-3 block text-3xl sm:text-4xl">
            &amp;
          </span>
          <span className="block">Gift</span>
        </h1>

        <div
          aria-hidden="true"
          className="bg-wedding-blue my-9 h-px w-20 sm:w-28"
        />

        <p className="text-wedding-brown max-w-md text-base leading-7 sm:text-lg">
          Our celebration is taking shape.
        </p>
      </section>

      <p className="text-wedding-brown absolute bottom-7 text-xs sm:bottom-9">
        Felix &amp; Gift
      </p>
    </main>
  );
}
