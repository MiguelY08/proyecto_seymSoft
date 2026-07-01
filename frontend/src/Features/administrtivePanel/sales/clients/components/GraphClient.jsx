/**
 * Archivo: GraphClient.jsx
 *
 * Componente que renderiza una gráfica de área SVG con datos de compras
 * mensuales reales de un cliente. Obtiene los datos del backend.
 *
 * Props:
 * @param {number} clientId - ID del cliente para cargar sus compras reales
 * @param {string} clientStartDate - Fecha de inicio del cliente
 */
import { useState, useEffect } from 'react';
import { clientsService } from '../services/clientsService';

function GraphClient({ clientId, clientStartDate = '07/05/2023' }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalGeneral, setTotalGeneral] = useState(0);
  const [availableYears, setAvailableYears] = useState([]);
  const [purchasesCache, setPurchasesCache] = useState(null);

  useEffect(() => {
    if (clientId) {
      loadPurchases();
    }
  }, [clientId]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const purchasesData = await clientsService.getClientPurchases(clientId);
      setPurchasesCache(purchasesData);
      
      if (purchasesData && purchasesData.byMonth) {
        const years = [...new Set(purchasesData.byMonth.map(item => item.year))];
        setAvailableYears(years.sort((a, b) => b - a));
        
        const defaultYear = years.length > 0 ? years[0] : new Date().getFullYear();
        setSelectedYear(defaultYear);
        filterDataByYear(purchasesData.byMonth, defaultYear);
        setTotalGeneral(purchasesData.total || 0);
      } else {
        setData([]);
        setTotalGeneral(0);
      }
    } catch (error) {
      setData([]);
      setTotalGeneral(0);
    } finally {
      setLoading(false);
    }
  };

  const filterDataByYear = (allData, year) => {
    const filtered = allData.filter(item => item.year === year);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const completeData = monthNames.map(month => {
      const existing = filtered.find(item => item.month === month);
      return {
        month,
        monthFull: existing?.monthFull || month,
        value: existing ? existing.total : 0,
        count: existing ? existing.count : 0,
        year
      };
    });
    setData(completeData);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (purchasesCache && purchasesCache.byMonth) {
      filterDataByYear(purchasesCache.byMonth, year);
    }
  };

  const totalForSelectedYear = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div className="bg-white flex flex-col h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Cargando compras...</p>
        </div>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="bg-white flex flex-col h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Sin compras registradas</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Cliente desde:</span>
            <span className="text-gray-800 font-semibold">{clientStartDate}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">Total general:</span>
            <span className="text-[#004D77] font-bold text-lg">$0</span>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 100;
  const height = 60;
  const padding = { top: 5, right: 3, bottom: 12, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (chartWidth / (data.length - 1)) * i;
    const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  const areaPath = `
    M ${padding.left} ${padding.top + chartHeight}
    ${points.map(p => `L ${p.x} ${p.y}`).join(' ')}
    L ${padding.left + chartWidth} ${padding.top + chartHeight}
    Z
  `;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const getTooltipPosition = (index) => {
    const point = points[index];
    const tooltipWidth = 40;
    const tooltipHeight = 12;
    
    let x = point.x - tooltipWidth / 2;
    let y = point.y - tooltipHeight - 3;
    
    if (x < padding.left) x = padding.left + 1;
    if (x + tooltipWidth > width - padding.right) x = width - padding.right - tooltipWidth - 1;
    if (y < padding.top) y = point.y + 3;
    
    return { x, y };
  };

  return (
    <div className="bg-white flex flex-col h-full">
      
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
        <h3 className="text-3xl font-bold text-gray-800">{selectedYear}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">AÑO</span>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 flex items-center justify-center">
        <svg 
          width="100%" 
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#004D77" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#004D77" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {[0, 10, 20, 30, 40, 50].map((value) => {
            const y = padding.top + chartHeight - (value / 50) * chartHeight;
            const maxValueMillion = maxValue / 1000000;
            const labelValue = (maxValueMillion * (value / 50)).toFixed(1);
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
                  ${labelValue}M
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#areaGradient)" />
          <path d={linePath} fill="none" stroke="#004D77" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, i) => (
            <g key={i}>
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

          {hoveredMonth !== null && (() => {
            const pos = getTooltipPosition(hoveredMonth);
            const point = points[hoveredMonth];
            return (
              <g>
                <rect
                  x={pos.x}
                  y={pos.y}
                  width="40"
                  height="12"
                  rx="1"
                  fill="white"
                  stroke="#004D77"
                  strokeWidth="0.4"
                  className="drop-shadow-lg"
                />
                <text
                  x={pos.x + 20}
                  y={pos.y + 3.5}
                  textAnchor="middle"
                  className="text-[2.2px] font-bold fill-[#004D77]"
                >
                  {point.monthFull} {selectedYear}
                </text>
                <text
                  x={pos.x + 20}
                  y={pos.y + 6.5}
                  textAnchor="middle"
                  className="text-[1.8px] font-bold fill-gray-600"
                >
                  Compras: {point.count}
                </text>
                <text
                  x={pos.x + 20}
                  y={pos.y + 9.5}
                  textAnchor="middle"
                  className="text-[1.8px] font-bold fill-gray-600"
                >
                  Total: ${point.value.toLocaleString('es-CO')}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Cliente desde:</span>
          <span className="text-gray-800 font-semibold">{clientStartDate}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Total del año {selectedYear}:</span>
          <span className="text-gray-800 font-bold">
            ${totalForSelectedYear.toLocaleString('es-CO')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Total general:</span>
          <span className="text-[#004D77] font-bold text-lg">
            ${totalGeneral.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

    </div>
  );
}

export default GraphClient;
