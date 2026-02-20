function ShopHero({ image, title }) {
  return (
    <section className="mt-2 w-full flex items-center justify-center">
      <div className="w-full sm:w-[98%] lg:w-[95%] h-[20vh] relative overflow-hidden rounded-lg">
        
        {/* Imagen fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />

        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-blue-950/75" />

        {/* Contenido */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            {title}
          </h2>
        </div>

      </div>
    </section>
  );
}

export default ShopHero;
