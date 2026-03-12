// data/returnsService.jsx
const STORAGE_KEY = 'returns';

// Función para generar IDs simples
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Inicializar datos por defecto si no existen
const initializeReturns = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const today = new Date().toISOString();
    const defaultReturns = [
      {
        id: generateId(),
        numeroDevolucion: 'DEV-2024-001',
        numeroFactura: 'FAC-001',
        cliente: 'Carlos Ramírez Gómez',
        motivo: 'Producto defectuoso',
        fechaCreacion: today,
        totalValor: 150000,
        estado: 'Pendiente',
        asesor: 'Valentina Ocampo',
        domicilio: true,
        direccion: 'Cra 73 #21-30 (Belén San Bernardo)',
        telefono: '3143059988',
        descripcion: 'El producto llegó con daños físicos y no enciende',
        evidencias: [],
        productosDevueltos: [
          {
            id: 1,
            nombre: 'Laptop HP',
            cantidad: 1,
            precioUnit: 150000,
            motivo: 'Producto defectuoso',
            metodo: 'Reembolso',
            estado: 'Pendiente'
          }
        ],
        cantidadProductos: 1,
        totalUnidades: 1
      },
      {
        id: generateId(),
        numeroDevolucion: 'DEV-2024-002',
        numeroFactura: 'FAC-002',
        cliente: 'Ana Lucía Torres',
        motivo: 'Producto equivocado',
        fechaCreacion: today,
        totalValor: 45000,
        estado: 'Aprobada',
        asesor: 'Maria Gómez',
        domicilio: false,
        direccion: '',
        telefono: '3129087645',
        descripcion: 'Enviaron el modelo incorrecto',
        evidencias: [],
        productosDevueltos: [
          {
            id: 2,
            nombre: 'Mouse Inalámbrico',
            cantidad: 1,
            precioUnit: 45000,
            motivo: 'Producto equivocado',
            metodo: 'Cambio',
            estado: 'Aprobada'
          }
        ],
        cantidadProductos: 1,
        totalUnidades: 1
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReturns));
    return defaultReturns;
  }
  return JSON.parse(existing);
};

// Obtener todas las devoluciones
export const getReturns = () => {
  return initializeReturns();
};

// Obtener todas las devoluciones
export const getAllReturns = () => {
  return initializeReturns();
};

// Obtener devolución por ID
export const getReturnById = (id) => {
  const returns = initializeReturns();
  return returns.find(r => r.id === id) || null;
};

// Crear nueva devolución (SIN base64 en evidencias)
export const createReturn = (returnData) => {
  try {
    console.log('createReturn - Datos recibidos:', returnData);
    
    const returns = initializeReturns();
    
    // Extraer evidencias y procesarlas (guardar solo metadata)
    const { evidencias, ...restData } = returnData;
    
    // Guardar solo metadata de evidencias, NUNCA el base64
    const evidenceMetadata = (evidencias || []).map(ev => {
      // Si ya tiene base64, lo eliminamos
      const { base64, ...metadata } = ev;
      return {
        id: metadata.id || generateId(),
        name: metadata.name || 'archivo',
        type: metadata.type || 'application/octet-stream',
        size: metadata.size || 0,
        uploadedAt: metadata.uploadedAt || new Date().toISOString()
        // NOTA: base64 está EXCLUIDO
      };
    });
    
    const newReturn = {
      id: generateId(),
      numeroDevolucion: `DEV-${new Date().getFullYear()}-${String(returns.length + 1).padStart(3, '0')}`,
      numeroFactura: restData.noFactura || restData.numeroFactura || '',
      cliente: restData.cliente || '',
      motivo: restData.motivo || (restData.productosDevueltos?.[0]?.motivo) || '',
      fechaCreacion: new Date().toISOString(),
      totalValor: restData.totalValor || 0,
      estado: restData.estadoGral || restData.estado || 'Pendiente',
      asesor: restData.asesor || '',
      domicilio: restData.domicilio || false,
      direccion: restData.direccion || '',
      telefono: restData.telefono || '',
      descripcion: restData.descripcion || '',
      evidencias: evidenceMetadata,
      productosDevueltos: restData.productos || restData.productosDevueltos || [],
      cantidadProductos: restData.cantidadProductos || (restData.productos?.length) || 0,
      totalUnidades: restData.totalUnidades || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('newReturn creado (sin base64):', newReturn);
    
    returns.push(newReturn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
    
    return newReturn;
  } catch (error) {
    console.error('Error en createReturn:', error);
    throw error;
  }
};

// Actualizar devolución (SIN base64 en evidencias)
export const updateReturn = (id, updatedData) => {
  try {
    console.log('updateReturn - ID:', id);
    console.log('updateReturn - Datos:', updatedData);
    
    const returns = initializeReturns();
    const index = returns.findIndex(r => r.id === id);
    
    if (index !== -1) {
      // Extraer evidencias y procesarlas (guardar solo metadata)
      const { evidencias, ...restData } = updatedData;
      
      // Guardar solo metadata de evidencias, NUNCA el base64
      const evidenceMetadata = (evidencias || []).map(ev => {
        // Si ya tiene base64, lo eliminamos
        const { base64, ...metadata } = ev;
        return {
          id: metadata.id || generateId(),
          name: metadata.name || 'archivo',
          type: metadata.type || 'application/octet-stream',
          size: metadata.size || 0,
          uploadedAt: metadata.uploadedAt || new Date().toISOString()
        };
      });
      
      returns[index] = {
        ...returns[index],
        numeroFactura: restData.noFactura || restData.numeroFactura || returns[index].numeroFactura,
        cliente: restData.cliente || returns[index].cliente,
        motivo: restData.motivo || (restData.productos?.[0]?.motivo) || returns[index].motivo,
        totalValor: restData.totalValor || returns[index].totalValor,
        estado: restData.estadoGral || restData.estado || returns[index].estado,
        asesor: restData.asesor || returns[index].asesor,
        domicilio: restData.domicilio !== undefined ? restData.domicilio : returns[index].domicilio,
        direccion: restData.direccion || returns[index].direccion,
        telefono: restData.telefono || returns[index].telefono,
        descripcion: restData.descripcion || returns[index].descripcion,
        evidencias: evidenceMetadata,
        productosDevueltos: restData.productos || restData.productosDevueltos || returns[index].productosDevueltos,
        cantidadProductos: restData.cantidadProductos || (restData.productos?.length) || returns[index].cantidadProductos,
        totalUnidades: restData.totalUnidades || returns[index].totalUnidades,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Devolución actualizada (sin base64):', returns[index]);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
      return returns[index];
    }
    
    console.log('No se encontró devolución con id:', id);
    return null;
  } catch (error) {
    console.error('Error en updateReturn:', error);
    throw error;
  }
};

// Anular devolución (con motivo)
export const cancelReturn = (id, motivo) => {
  const returns = initializeReturns();
  const index = returns.findIndex(r => r.id === id);
  
  if (index !== -1) {
    returns[index].estado = 'Anulada';
    returns[index].cancelReason = motivo;
    returns[index].cancelledAt = new Date().toISOString();
    returns[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
    return returns[index];
  }
  return null;
};

// Eliminar devolución permanentemente
export const deleteReturn = (id) => {
  const returns = initializeReturns();
  const filtered = returns.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Convertir archivo a base64 (SOLO PARA USO TEMPORAL)
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Guardar evidencias (AHORA SOLO RETORNA METADATA)
export const saveEvidence = async (returnId, files) => {
  console.log('saveEvidence - returnId:', returnId);
  console.log('saveEvidence - files:', files);
  
  try {
    // Por ahora, solo retornamos metadata (sin guardar en localStorage)
    // En el futuro, aquí puedes agregar la subida a servidor
    return Array.from(files).map(file => ({
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Error en saveEvidence:', error);
    throw error;
  }
};