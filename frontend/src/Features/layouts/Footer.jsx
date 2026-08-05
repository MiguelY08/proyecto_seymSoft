import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/PapeleriaMagicLogo_512x512.png';
import horizontalLogo from "../../assets/PMLogo_Horizontal.png";
import instagramLogo from '../../assets/socialMedia/instagramWhite.png';
import tiktokLogo from '../../assets/socialMedia/tiktokWhite.png';
import whatsappLogo from '../../assets/socialMedia/whatsappWhite.png';
import { MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import categoriesService from '../administrtivePanel/purchases/categories/services/categoriesService.js';

function Footer() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const allCategories = await categoriesService.getAll();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error cargando categorias del footer:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <footer
      style={{
        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      }}
      className="text-white mt-auto"
    >
      {/* Top accent line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd, #3b82f6)' }} />

      <div className="mx-auto max-w-[var(--store-content-max)] px-[var(--store-content-x)] py-10 sm:py-14">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-6">

          {/* ── Col 1: Brand (lg: span 3) ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full overflow-hidden shrink-0 md:hidden"
                style={{
                  width: 64, height: 64,
                  filter: 'drop-shadow(0 0 5px rgba(0,114,255,0.55))',
                }}
              >
                <img
                  src={logo}
                  alt="Logo Papelería Magic"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </div>
              <div className="md:hidden">
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  Papelería
                </h2>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#93c5fd',
                    lineHeight: 1.2,
                  }}
                >
                  Magic
                </h2>
              </div>
              <img
                src={horizontalLogo}
                alt="Papelería Magic"
                className="hidden md:block"
                style={{
                  width: 210,
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 5px rgba(199, 224, 255, 0.8)',
                }}
              />
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7 }}>
              Somos una empresa distribuidora de Papelería al por mayor y detal con envíos a todo Colombia.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { href: 'https://www.instagram.com/papeleriamagic/', src: instagramLogo, alt: 'Instagram' },
                { href: 'https://www.tiktok.com/@papeleria_magic?is_from_webapp=1&sender_device=pc', src: tiktokLogo, alt: 'TikTok' },
                { href: 'https://wa.me/573002936722', src: whatsappLogo, alt: 'WhatsApp' },
              ].map(({ href, src, alt }) => (
                <a
                  key={alt}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: 'rgba(59,130,246,0.18)',
                    border: '1px solid rgba(96,165,250,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 7,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.45)';
                    e.currentTarget.style.borderColor = 'rgba(147,197,253,0.7)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.18)';
                    e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Categories (lg: span 2) ── */}
          <div className="lg:col-span-2">
            <h3
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#60a5fa',
                marginBottom: '1rem',
              }}
            >
              Categorías
            </h3>
            <ul className="flex flex-col gap-2">
              {loadingCategories ? (
                <li style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Cargando...</li>
              ) : categories.length > 0 ? (
                categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/shop?category=${category.id}`}
                      style={{
                        fontSize: '0.85rem',
                        color: '#cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'color 0.2s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#93c5fd'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; }}
                    >
                      <ChevronRight size={12} style={{ color: '#3b82f6', flexShrink: 0 }} />
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Sin categorias</li>
              )}
            </ul>
          </div>

          {/* ── Col 3: Contact (lg: span 3) ── */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <h3
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#60a5fa',
                marginBottom: '0.25rem',
              }}
            >
              Contacto
            </h3>

            {[
              {
                href: 'https://www.google.com/maps/place/Centro+Comercial+Manhatan+Plaza/@6.2491669,-75.5729839,360m/data=!3m1!1e3!4m6!3m5!1s0x8e4428fff68501a1:0x23df4219000eef2d!8m2!3d6.249001!4d-75.5731081!16s%2Fg%2F1v4k7kjj?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D',
                icon: <MapPin size={15} />,
                lines: ['Medellín, Colombia', 'Cra. 55 #46-64 (La Candelaria)', 'CC Manhattan Plaza', '▶ Local 112', '▶ Ventas 1102'],
                external: true,
              },
              {
                href: 'mailto:papeleriamagic.jj@hotmail.com',
                icon: <Mail size={15} />,
                lines: ['papeleriamagic.jj@hotmail.com'],
                external: false,
              },
              {
                href: null,
                icon: <Phone size={15} />,
                phones: [
                  { label: 'Mayoristas', number: '(+57) 300 293 6722', tel: 'tel:+573002936722' },
                  { label: 'Detal', number: '(+57) 321 282 8628', tel: 'tel:+573212828628' },
                ],
                external: false,
              },
            ].map(({ href, icon, lines, phones, external }, i) => {
              const baseStyle = {
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                color: '#cbd5e1',
                textDecoration: 'none',
                transition: 'color 0.2s',
              };

              const innerContent = (
                <>
                  <span style={{ color: '#3b82f6', marginTop: 2, flexShrink: 0 }}>{icon}</span>
                  <div>
                    {phones
                      ? phones.map(({ label, number, tel }, j) => (
                          <a
                            key={j}
                            href={tel}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: '0.82rem',
                              lineHeight: 1.8,
                              color: '#cbd5e1',
                              textDecoration: 'none',
                              transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#93c5fd'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; }}
                          >
                            <span style={{ color: '#60a5fa', fontWeight: 600, minWidth: 78 }}>{label}:</span>
                            {number}
                          </a>
                        ))
                      : lines.map((line, j) => (
                          <p key={j} style={{ fontSize: '0.82rem', lineHeight: 1.65 }}>{line}</p>
                        ))
                    }
                  </div>
                </>
              );

              return phones ? (
                <div key={i} style={baseStyle}>{innerContent}</div>
              ) : (
                <a
                  key={i}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  style={{ ...baseStyle, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#93c5fd'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; }}
                >
                  {innerContent}
                </a>
              );
            })}
          </div>

          {/* ── Col 4: Map (lg: span 4) ── */}
          <div className="lg:col-span-4 md:col-span-2">
            <h3
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#60a5fa',
                marginBottom: '0.75rem',
              }}
            >
              Encuéntranos
            </h3>
            <div
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(96,165,250,0.2)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1417.6090066069087!2d-75.57370342476612!3d6.249136463623266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4428fff68501a1%3A0x23df4219000eef2d!2sCentro%20Comercial%20Manhatan%20Plaza!5e0!3m2!1ses!2sco!4v1779944639613!5m2!1ses!2sco"
                width="100%"
                height="190"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Papelería Magic"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(148,163,184,0.12)',
            marginTop: '2.5rem',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <p style={{ fontSize: '0.73rem', color: '#475569' }}>
            © 2025 Papelería Magic · Todos los derechos reservados
          </p>
          <p style={{ fontSize: '0.73rem', color: '#475569' }}>
            Impulsado por{' '}
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>SeymSoft</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
