export default function LoginBanner({ titulo, imagen }) {
  return (
    <section
      className="relative w-full h-[80px] sm:h-[100px] md:h-[120px] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${imagen})`
      }}
    >
      {/* Overlay azul corporativo */}
      <div className="absolute inset-0 bg-[#003049]/85"></div>

      <div className="relative z-10 text-center px-4">
        <h1 className="font-lexend text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wide text-white">
          {titulo}
        </h1>
      </div>
    </section>
  )
}
