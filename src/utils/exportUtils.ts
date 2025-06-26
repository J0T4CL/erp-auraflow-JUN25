export const exportToCSV = (data: any[], filename: string, headers?: string[]) => {
  if (data.length === 0) return;

  const csvHeaders = headers || Object.keys(data[0]);
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToJSON = (data: any[], filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

export const exportToExcel = (data: any[], filename: string) => {
  // Para Excel, usamos CSV con BOM para mejor compatibilidad
  const csvHeaders = Object.keys(data[0] || {});
  const csvContent = '\ufeff' + [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename.replace('.xlsx', '.csv'), 'text/csv');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateInventoryReport = (products: any[]) => {
  return products.map(product => ({
    'SKU': product.sku,
    'Nombre': product.name,
    'Descripción': product.description || '',
    'Categoría': product.category?.name || '',
    'Precio': product.price,
    'Costo': product.cost,
    'Stock Actual': product.stock,
    'Stock Mínimo': product.minStock,
    'Valor Inventario': product.price * product.stock,
    'Margen': product.price > 0 ? ((product.price - product.cost) / product.price * 100).toFixed(2) + '%' : '0%',
    'Estado': product.isActive ? 'Activo' : 'Inactivo',
    'Unidad': product.unit,
    'Código de Barras': product.barcode || '',
    'Fecha Creación': new Date(product.createdAt).toLocaleDateString(),
    'Última Actualización': new Date(product.updatedAt).toLocaleDateString()
  }));
};