/**
 * Archivo: returnsService.js
 * 
 * Servicio de gestión de devoluciones que proporciona todas las operaciones
 * CRUD (Create, Read, Update, Delete) para el módulo de devoluciones.
 * 
 * Responsabilidades principales:
 * - Almacenar y recuperar devoluciones desde localStorage
 * - Crear nuevas devoluciones con datos completos
 * - Actualizar devoluciones existentes
 * - Anular devoluciones con motivo registrado
 * - Eliminar devoluciones permanentemente
 * - Gestionar evidencias asociadas a las devoluciones
 * - Inicializar datos por defecto si no existen
 * - Generar IDs únicos para las devoluciones
 * 
 * Este servicio es la capa de acceso a datos y se comunica directamente
 * con localStorage como base de datos persistente.
 */

const STORAGE_KEY = 'returns';

// ======================= FUNCIONALIDAD: UTILIDADES =======================

/**
 * Genera un identificador único mediante timestamp y número aleatorio.
 * Se utiliza para crear IDs únicos para devoluciones y evidencias.
 * 
 * @returns {string} ID único generado
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Inicializa datos por defecto si no existen en localStorage.
 * Verifica si ya hay devoluciones guardadas; si no, crea dos devoluciones de ejemplo.
 * 
 * @returns {Array} Array de devoluciones (existentes o creadas por defecto)
 */
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
        motivo: 'DEFECTUOSO',
        fechaCreacion: today,
        totalValor: 150000,
        estado: 'En Proceso',
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
            motivo: 'DEFECTUOSO',
            metodo: 'Reembolso',
            estado: 'Pend. Envío'
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
        motivo: 'PRODUCTO_EQUIVOCADO',
        fechaCreacion: today,
        totalValor: 45000,
        estado: 'Procesada',
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
            motivo: 'PRODUCTO_EQUIVOCADO',
            metodo: 'Reemplazo',
            estado: 'Entregado'
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

// ======================= FUNCIONALIDAD: LECTURA =======================

/**
 * Obtiene todas las devoluciones almacenadas en localStorage.
 * Inicializa los datos si es la primera vez que se accede.
 * 
 * @returns {Array} Array de todas las devoluciones
 */
export const getReturns = () => {
  return initializeReturns();
};

/**
 * Obtiene todas las devoluciones (alias de getReturns).
 * Proporciona un método alternativo para obtener el listado completo.
 * 
 * @returns {Array} Array de todas las devoluciones
 */
export const getAllReturns = () => {
  return initializeReturns();
};

/**
 * Obtiene una devolución específica por su ID único.
 * 
 * @param {string} id - ID único de la devolución a buscar
 * @returns {Object|null} Objeto de devolución si existe, null si no se encuentra
 */
export const getReturnById = (id) => {
  const returns = initializeReturns();
  return returns.find(r => r.id === id) || null;
};

// ======================= FUNCIONALIDAD: CREAR =======================

/**
 * Crea una nueva devolución con los datos proporcionados.
 * Genera automáticamente número de devolución, IDs únicos y timestamps.
 * Las evidencias se guardan solo como metadata, SIN datos en base64.
 * 
 * @param {Object} returnData - Datos de la devolución a crear
 * @param {string} returnData.noFactura - Número de factura de referencia
 * @param {string} returnData.cliente - Nombre del cliente
 * @param {string} returnData.motivo - Motivo principal de la devolución
 * @param {number} returnData.totalValor - Valor total a devolver
 * @param {string} returnData.asesor - Nombre del asesor que atiende
 * @param {boolean} returnData.domicilio - Si requiere servicio a domicilio
 * @param {string} returnData.direccion - Dirección de entrega
 * @param {string} returnData.telefono - Teléfono de contacto
 * @param {string} returnData.descripcion - Descripción detallada
 * @param {Array} returnData.productos - Array de productos devueltos
 * @param {Array} returnData.evidencias - Array de archivos adjuntos (metadata)
 * @returns {Object} Objeto de devolución creado con ID y timestamps
 * @throws {Error} Si hay error al procesar los datos
 */
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
      // Estado automático: siempre "En Proceso" al crear
      estado: 'En Proceso',
      estadoGral: 'En Proceso',
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

// ======================= FUNCIONALIDAD: EDITAR =======================

/**
 * Actualiza una devolución existente con nuevos datos.
 * Las evidencias se guardan solo como metadata, SIN datos en base64.
 * Mantiene datos no modificados del registro original.
 * 
 * @param {string} id - ID único de la devolución a actualizar
 * @param {Object} updatedData - Datos a actualizar
 * @param {string} updatedData.noFactura - Número de factura actualizado
 * @param {string} updatedData.cliente - Cliente actualizado
 * @param {string} updatedData.motivo - Motivo actualizado
 * @param {number} updatedData.totalValor - Valor actualizado
 * @param {string} updatedData.asesor - Asesor actualizado
 * @param {boolean} updatedData.domicilio - Servicio a domicilio
 * @param {string} updatedData.direccion - Dirección actualizada
 * @param {string} updatedData.telefono - Teléfono actualizado
 * @param {string} updatedData.descripcion - Descripción actualizada
 * @param {Array} updatedData.productos - Productos actualizados
 * @param {Array} updatedData.evidencias - Evidencias actualizadas (metadata)
 * @returns {Object|null} Devolución actualizada o null si no existe
 * @throws {Error} Si hay error al procesar los datos
 */
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

// ======================= FUNCIONALIDAD: ANULAR =======================

/**
 * Anula una devolución existente, registrando el motivo y la fecha de anulación.
 * Cambia el estado a 'Anulada' y almacena el motivo proporcionado.
 * Esta acción es permanente e irreversible.
 * 
 * @param {string} id - ID único de la devolución a anular
 * @param {string} motivo - Motivo por el cual se anula la devolución
 * @returns {Object|null} Devolución anulada o null si no existe
 */
export const cancelReturn = (id, motivo) => {
  const returns = initializeReturns();
  const index = returns.findIndex(r => r.id === id);
  
  if (index !== -1) {
    returns[index].estado = 'Anulado';
    returns[index].cancelReason = motivo;
    returns[index].cancelledAt = new Date().toISOString();
    returns[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returns));
    return returns[index];
  }
  return null;
};

/**
 * Elimina una devolución permanentemente de la base de datos.
 * Esta acción es destructiva e irreversible.
 * 
 * @param {string} id - ID único de la devolución a eliminar
 * @returns {boolean} true si se eliminó exitosamente
 */
export const deleteReturn = (id) => {
  const returns = initializeReturns();
  const filtered = returns.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// ======================= FUNCIONALIDAD: EVIDENCIAS =======================

/**
 * Convierte un archivo a formato base64 para almacenamiento temporal.
 * NOTA: Solo se usa de manera temporal. No se debe guardar base64 en localStorage.
 * 
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>} Promise que resuelve con el contenido en base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Procesa y guarda las evidencias de una devolución.
 * Extrae la metadata de los archivos sin guardar contenido base64.
 * Genera IDs únicos para cada archivo y registra la fecha de carga.
 * 
 * NOTA: En el futuro, esta función será extendida para guardar archivos en servidor.
 * 
 * @param {string} returnId - ID de la devolución asociada
 * @param {FileList} files - Lista de archivos a procesar
 * @returns {Promise<Array>} Promise que resuelve con array de metadatos de archivos
 * @throws {Error} Si hay error al procesar los archivos
 */
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