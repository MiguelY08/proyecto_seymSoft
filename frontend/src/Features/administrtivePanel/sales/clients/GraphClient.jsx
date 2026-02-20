import React, { useState } from 'react';

// Datos de ejemplo de compras por mes
const generateMockData = (year = 2024) => {
  return [
    { month: 'Ene', value: 30000000, products: 65 },
    { month: 'Feb', value: 18000000, products: 45 },
    { month: 'Mar', value: 15000000, products: 38 },
    { month: 'Abr', value: 7000000, products: 22 },
    { month: 'May', value: 12000000, products: 35 },
    { month: 'Jun', value: 13000000, products: 40 },
    { month: 'Jul', value: 17000000, products: 48 },
    { month: 'Ago', value: 9000000, products: 28 },
    { month: 'Sep', value: 6000000, products: 18 },
    { month: 'Oct', value: 20000000, products: 55 },
    { month: 'Nov', value: 14000000, products: 42 },
    { month: 'Dic', value: 19000000, products: 50 },
  ];
};

function GraphClient({ clientStartDate = '07/05/2023' }) {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  
  const data = generateMockData(selectedYear);
  const maxValue = Math.max(...data.map(d => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);
  const totalProducts = data.reduce((sum, d) => sum + d.products, 0);

  // Calcular coordenadas para el gráfico de área - Ajustado para mejor proporción
  const width = 100; // Usaremos porcentaje para mejor responsividad
  const height = 60; // Proporción relativa
  const padding = { top: 5, right: 3, bottom: 12, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (chartWidth / (data.length - 1)) * i;
    const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  // Crear path para el área (con gradiente)
  const areaPath = `
    M ${padding.left} ${padding.top + chartHeight}
    ${points.map(p => `L ${p.x} ${p.y}`).join(' ')}
    L ${padding.left + chartWidth} ${padding.top + chartHeight}
    Z
  `;

  // Crear path para la línea
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Calcular posición del tooltip para que no se salga del viewport
  const getTooltipPosition = (index) => {
    const point = points[index];
    const tooltipWidth = 28;
    const tooltipHeight = 12;
    
    let x = point.x - tooltipWidth / 2;
    let y = point.y - tooltipHeight - 3;
    
    // Ajustar si se sale por la izquierda
    if (x < padding.left) {
      x = padding.left + 1;
    }
    
    // Ajustar si se sale por la derecha
    if (x + tooltipWidth > width - padding.right) {
      x = width - padding.right - tooltipWidth - 1;
    }
    
    // Ajustar si se sale por arriba
    if (y < padding.top) {
      y = point.y + 3; // Mostrar debajo del punto
    }
    
    return { x, y };
  };

  return (
    <div className="bg-white flex flex-col h-full">
      
      {/* Header con selector de año */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <h3 className="text-3xl font-bold text-gray-800">{selectedYear}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">AÑO</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700"
          >
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
        </div>
      </div>

      {/* Gráfico SVG - Mejorado con mejor proporción */}
      <div className="flex-1 px-4 py-3 flex items-center justify-center">
        <svg 
          width="100%" 
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          {/* Definir gradiente */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#004D77" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#004D77" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Líneas de grid horizontales */}
          {[0, 10, 20, 30, 40, 50].map((value) => {
            const y = padding.top + chartHeight - (value / 50) * chartHeight;
            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="0.2"
                />
                <text
                  x={padding.left - 1.5}
                  y={y + 0.8}
                  textAnchor="end"
                  className="text-[2px] fill-gray-400"
                >
                  ${value}M
                </text>
              </g>
            );
          })}

          {/* Área con gradiente */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Línea principal */}
          <path
            d={linePath}
            fill="none"
            stroke="#004D77"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos y labels de meses */}
          {points.map((point, i) => (
            <g key={i}>
              {/* Punto */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredMonth === i ? 1.2 : 0.8}
                fill="#004D77"
                stroke="white"
                strokeWidth="0.4"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredMonth(i)}
                onMouseLeave={() => setHoveredMonth(null)}
              />
              
              {/* Label de mes */}
              <text
                x={point.x}
                y={padding.top + chartHeight + 4}
                textAnchor="middle"
                className="text-[2.2px] fill-gray-600 font-medium"
              >
                {point.month}
              </text>
            </g>
          ))}

          {/* Tooltip al hacer hover - Mejorado con mejor posicionamiento */}
          {hoveredMonth !== null && (() => {
            const pos = getTooltipPosition(hoveredMonth);
            return (
              <g>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width="28"
                  height="12"
                  rx="1"
                  fill="white"
                  stroke="#004D77"
                  strokeWidth="0.4"
                  className="drop-shadow-lg"
                />
                <text
                  x={pos.x + 14}
                  y={pos.y + 3.5}
                  textAnchor="middle"
                  className="text-[2.2px] font-bold fill-[#004D77]"
                >
                  {points[hoveredMonth].month} {selectedYear}
                </text>
                <text
                  x={pos.x + 14}
                  y={pos.y + 6.5}
                  textAnchor="middle"
                  className="text-[1.8px] fill-gray-600"
                >
                  Productos: {points[hoveredMonth].products}
                </text>
                <text
                  x={pos.x + 14}
                  y={pos.y + 9.5}
                  textAnchor="middle"
                  className="text-[1.8px] fill-gray-600"
                >
                  ${(points[hoveredMonth].value / 1000000).toFixed(1)}M
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Footer con estadísticas */}
      <div className="px-6 py-4 border-t border-gray-200 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Cliente desde:</span>
          <span className="text-gray-800 font-semibold">{clientStartDate}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Total:</span>
          <span className="text-[#004D77] font-bold text-lg">
            ${totalValue.toLocaleString('es-CO')}.00
          </span>
        </div>
      </div>

    </div>
  );
}

export default GraphClient;
