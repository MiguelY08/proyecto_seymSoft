export default function LoginBanner({ titulo, imagen, logo }) {
  return (
    <section
      className="relative w-full h-[90px] sm:h-[105px] md:h-[120px] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${imagen})`
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#003049]/85"></div>

      {/* LOGO */}
      {logo && (
        <div className="absolute left-4 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-10">
          <img
            src={logo}
            alt="logo empresa"
            className="h-16 sm:h-20 md:h-24 lg:h-28 object-contain"
          />
        </div>
      )}

      {/* TITULO */}
      <div className="relative z-10 text-center px-4">
        <h1 className="font-lexend text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide text-white">
          {titulo}
        </h1>
      </div>
    </section>
  )
}