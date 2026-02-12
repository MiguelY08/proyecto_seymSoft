import React from 'react';
import logo from '../../assets/PapeleriaMagicLogo.png';
import instagramLogo from '../../assets/socialMedia/instagramWhite.png';
import tiktokLogo from '../../assets/socialMedia/tiktokWhite.png';
import whatsappLogo from '../../assets/socialMedia/whatsappWhite.png';
import { MapPin, Mail, Phone } from 'lucide-react';

function Footer() {
  const categories = ['Escolar', 'Oficina', 'Escritura', 'Papelería básica', 'Arte'];

  return (
    <footer className="bg-slate-700 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Sección 3: Categorías - Primero en mobile */}
          <div className="order-1 md:order-3">
            <h3 className="text-lg font-semibold mb-4">Categorías</h3>
            <ul className="flex flex-col gap-2">
              {categories.map((category, index) => (
                <li key={index}>
                  <a 
                    href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sección 2: Ubicación y Contacto - Segundo en mobile */}
          <div className="flex flex-col gap-4 order-2">
            <h3 className="text-lg font-semibold mb-4">Contacto y ubicación</h3>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Carrera+55+%2346-64+LC+112+Medellín+Colombia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-start gap-3 hover:text-blue-300 transition-colors cursor-pointer group"
            >
              <MapPin className="w-5 h-5 text-white shrink-0 mt-1 group-hover:text-blue-300 transition-colors" strokeWidth={2} />
              <div>
                <p className="text-sm">Medellín - Colombia</p>
                <p className="text-sm">Carrera 55 #46-64 LC 112 (La candelaria)</p>
                <p className="text-sm">CC Manhattan</p>
              </div>
            </a>

            <a 
              href="mailto:papeleriamagic.jj@hotmail.com"
              className="flex items-center gap-3 hover:text-blue-300 transition-colors cursor-pointer group"
            >
              <Mail className="w-5 h-5 text-white shrink-0 group-hover:text-blue-300 transition-colors" strokeWidth={2} />
              <span className="text-sm">
                papeleriamagic.jj@hotmail.com
              </span>
            </a>

            <a 
              href="tel:+573002936722"
              className="flex items-center gap-3 hover:text-blue-300 transition-colors cursor-pointer group"
            >
              <Phone className="w-5 h-5 text-white shrink-0 group-hover:text-blue-300 transition-colors" strokeWidth={2} />
              <span className="text-sm">
                (+57) 300 293 6722
              </span>
            </a>
          </div>

          {/* Sección 1: Logo y Redes Sociales - Tercero en mobile */}
          <div className="flex flex-col items-center md:items-start order-3 md:order-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-40 h-40 rounded-full overflow-hidden shrink-0">
                <img src={logo} alt="Logo Papelería Magic" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-serif italic font-semibold">
                Papelería Magic
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 p-1 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer overflow-hidden"
              >
                <img src={instagramLogo} alt="Instagram" className="w-full h-full object-cover" />
              </a>
              
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 p-1 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer overflow-hidden"
              >
                <img src={tiktokLogo} alt="TikTok" className="w-full h-full object-cover" />
              </a>
              
              <a 
                href="https://wa.me/573002936722" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 p-1 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer overflow-hidden"
              >
                <img src={whatsappLogo} alt="WhatsApp" className="w-full h-full object-cover" />
              </a>
            </div>          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-slate-600 mt-8 pt-6">
          <p className="text-xs text-center text-gray-400">
            Derechos reservados 2025 | Impulsado por SeymSoft ©
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;