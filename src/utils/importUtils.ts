export interface ImportValidationResult {
  isValid: boolean;
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; field: string; message: string }>;
}

export const validateProductData = (products: any[]): ImportValidationResult => {
  const result: ImportValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const requiredFields = ['sku', 'name', 'price'];
  const numericFields = ['price', 'cost', 'stock', 'minStock'];
  const skuSet = new Set();

  products.forEach((product, index) => {
    const row = index + 1;

    // Validar campos requeridos
    requiredFields.forEach(field => {
      if (!product[field] || product[field].toString().trim() === '') {
        result.errors.push({
          row,
          field,
          message: `${field} es requerido`
        });
        result.isValid = false;
      }
    });

    // Validar SKU único
    if (product.sku) {
      if (skuSet.has(product.sku)) {
        result.errors.push({
          row,
          field: 'sku',
          message: 'SKU duplicado en el archivo'
        });
        result.isValid = false;
      } else {
        skuSet.add(product.sku);
      }
    }

    // Validar campos numéricos
    numericFields.forEach(field => {
      if (product[field] !== undefined && product[field] !== '') {
        const value = parseFloat(product[field]);
        if (isNaN(value)) {
          result.errors.push({
            row,
            field,
            message: `${field} debe ser un número válido`
          });
          result.isValid = false;
        } else if (value < 0) {
          result.warnings.push({
            row,
            field,
            message: `${field} es negativo`
          });
        }
      }
    });

    // Validaciones específicas
    if (product.price && product.cost && parseFloat(product.price) < parseFloat(product.cost)) {
      result.warnings.push({
        row,
        field: 'price',
        message: 'Precio menor al costo'
      });
    }

    if (product.stock && product.minStock && parseInt(product.stock) <= parseInt(product.minStock)) {
      result.warnings.push({
        row,
        field: 'stock',
        message: 'Stock actual por debajo del mínimo'
      });
    }

    // Validar longitud de campos
    if (product.sku && product.sku.length > 50) {
      result.errors.push({
        row,
        field: 'sku',
        message: 'SKU muy largo (máximo 50 caracteres)'
      });
      result.isValid = false;
    }

    if (product.name && product.name.length > 200) {
      result.errors.push({
        row,
        field: 'name',
        message: 'Nombre muy largo (máximo 200 caracteres)'
      });
      result.isValid = false;
    }
  });

  return result;
};

export const parseCSVFile = (content: string): any[] => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line);
    const product: any = { _row: index + 2 };
    
    headers.forEach((header, i) => {
      const value = values[i] || '';
      const normalizedHeader = normalizeHeader(header);
      
      switch (normalizedHeader) {
        case 'sku':
          product.sku = value.trim();
          break;
        case 'nombre':
        case 'name':
          product.name = value.trim();
          break;
        case 'descripcion':
        case 'description':
          product.description = value.trim();
          break;
        case 'precio':
        case 'price':
          product.price = parseFloat(value) || 0;
          break;
        case 'costo':
        case 'cost':
          product.cost = parseFloat(value) || 0;
          break;
        case 'stock':
          product.stock = parseInt(value) || 0;
          break;
        case 'stockminimo':
        case 'minstock':
          product.minStock = parseInt(value) || 0;
          break;
        case 'unidad':
        case 'unit':
          product.unit = value.trim() || 'pieza';
          break;
        case 'categoria':
        case 'category':
          product.category = value.trim();
          break;
        case 'codigodebarras':
        case 'barcode':
          product.barcode = value.trim();
          break;
        case 'activo':
        case 'active':
          product.isActive = ['true', '1', 'si', 'yes', 'activo'].includes(value.toLowerCase().trim());
          break;
        default:
          // Campos adicionales
          product[normalizedHeader] = value.trim();
      }
    });
    
    return product;
  });
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '');
};

export const generateImportTemplate = (format: 'csv' | 'json') => {
  const sampleData = [
    {
      sku: 'PROD-001',
      name: 'Producto Ejemplo 1',
      description: 'Descripción del producto ejemplo',
      price: 99.99,
      cost: 60.00,
      stock: 50,
      minStock: 10,
      unit: 'pieza',
      category: 'Electrónicos',
      barcode: '1234567890123',
      isActive: true
    },
    {
      sku: 'PROD-002',
      name: 'Producto Ejemplo 2',
      description: 'Otro producto de ejemplo',
      price: 149.99,
      cost: 90.00,
      stock: 25,
      minStock: 5,
      unit: 'pieza',
      category: 'Hogar',
      barcode: '1234567890124',
      isActive: true
    }
  ];

  if (format === 'json') {
    return {
      products: sampleData
    };
  } else {
    const headers = ['SKU', 'Nombre', 'Descripción', 'Precio', 'Costo', 'Stock', 'Stock Mínimo', 'Unidad', 'Categoría', 'Código de Barras', 'Activo'];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(product => [
        product.sku,
        `"${product.name}"`,
        `"${product.description}"`,
        product.price,
        product.cost,
        product.stock,
        product.minStock,
        product.unit,
        product.category,
        product.barcode,
        product.isActive
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};