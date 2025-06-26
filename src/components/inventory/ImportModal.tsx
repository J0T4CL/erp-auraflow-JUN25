import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, FileSpreadsheet, Code, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { useInventoryStore } from '../../store/inventoryStore';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ImportResult {
  success: number;
  errors: Array<{ row: number; field: string; message: string; data: any }>;
  warnings: Array<{ row: number; field: string; message: string; data: any }>;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'manual' | 'api'>('file');
  const [importFormat, setImportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [manualProducts, setManualProducts] = useState([
    { sku: '', name: '', price: '', cost: '', stock: '', minStock: '', unit: 'pieza' }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addProduct, categories } = useInventoryStore();

  const csvTemplate = `SKU,Nombre,Descripción,Precio,Costo,Stock,Stock Mínimo,Unidad,Categoría,Código de Barras,Activo
PROD-001,Laptop Empresarial,Laptop para uso empresarial con Windows 11,25999.00,20000.00,15,5,pieza,Electrónicos,7891234567890,true
PROD-002,Mouse Inalámbrico,Mouse ergonómico inalámbrico,599.00,350.00,50,10,pieza,Electrónicos,7891234567891,true
PROD-003,Teclado Mecánico,Teclado mecánico retroiluminado,1299.00,800.00,25,8,pieza,Electrónicos,7891234567892,true`;

  const jsonTemplate = {
    products: [
      {
        sku: "PROD-001",
        name: "Laptop Empresarial",
        description: "Laptop para uso empresarial con Windows 11",
        price: 25999.00,
        cost: 20000.00,
        stock: 15,
        minStock: 5,
        unit: "pieza",
        category: "Electrónicos",
        barcode: "7891234567890",
        isActive: true,
        tags: ["electrónico", "laptop", "empresarial"]
      },
      {
        sku: "PROD-002",
        name: "Mouse Inalámbrico",
        description: "Mouse ergonómico inalámbrico",
        price: 599.00,
        cost: 350.00,
        stock: 50,
        minStock: 10,
        unit: "pieza",
        category: "Electrónicos",
        barcode: "7891234567891",
        isActive: true,
        tags: ["electrónico", "mouse", "inalámbrico"]
      }
    ]
  };

  const downloadTemplate = (format: 'csv' | 'excel' | 'json') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'csv':
        content = csvTemplate;
        filename = 'plantilla_inventario.csv';
        mimeType = 'text/csv';
        break;
      case 'excel':
        // Para Excel, usamos CSV con BOM para mejor compatibilidad
        content = '\ufeff' + csvTemplate;
        filename = 'plantilla_inventario.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(jsonTemplate, null, 2);
        filename = 'plantilla_inventario.json';
        mimeType = 'application/json';
        break;
      default:
        return;
    }

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      let products: any[] = [];

      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        products = jsonData.products || jsonData;
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        products = parseCSV(text);
      }

      const result = await processProducts(products);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: 0,
        errors: [{ row: 0, field: 'file', message: 'Error al procesar el archivo', data: {} }],
        warnings: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const product: any = { _row: index + 2 };
      
      headers.forEach((header, i) => {
        const value = values[i] || '';
        switch (header.toLowerCase()) {
          case 'sku':
            product.sku = value;
            break;
          case 'nombre':
            product.name = value;
            break;
          case 'descripción':
          case 'descripcion':
            product.description = value;
            break;
          case 'precio':
            product.price = parseFloat(value) || 0;
            break;
          case 'costo':
            product.cost = parseFloat(value) || 0;
            break;
          case 'stock':
            product.stock = parseInt(value) || 0;
            break;
          case 'stock mínimo':
          case 'stock minimo':
            product.minStock = parseInt(value) || 0;
            break;
          case 'unidad':
            product.unit = value || 'pieza';
            break;
          case 'categoría':
          case 'categoria':
            product.category = value;
            break;
          case 'código de barras':
          case 'codigo de barras':
            product.barcode = value;
            break;
          case 'activo':
            product.isActive = value.toLowerCase() === 'true' || value === '1';
            break;
        }
      });
      
      return product;
    });
  };

  const processProducts = async (products: any[]): Promise<ImportResult> => {
    const result: ImportResult = { success: 0, errors: [], warnings: [] };
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const row = product._row || i + 1;
      
      // Validaciones
      if (!product.sku) {
        result.errors.push({ row, field: 'sku', message: 'SKU es requerido', data: product });
        continue;
      }
      
      if (!product.name) {
        result.errors.push({ row, field: 'name', message: 'Nombre es requerido', data: product });
        continue;
      }
      
      if (product.price <= 0) {
        result.errors.push({ row, field: 'price', message: 'Precio debe ser mayor a 0', data: product });
        continue;
      }
      
      if (product.stock < 0) {
        result.warnings.push({ row, field: 'stock', message: 'Stock negativo', data: product });
      }
      
      if (product.stock <= product.minStock) {
        result.warnings.push({ row, field: 'stock', message: 'Stock por debajo del mínimo', data: product });
      }
      
      // Buscar categoría
      const category = categories.find(c => c.name.toLowerCase() === product.category?.toLowerCase()) || categories[0];
      
      // Crear producto
      try {
        addProduct({
          companyId: 'company-1',
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          category,
          price: product.price,
          cost: product.cost || 0,
          stock: product.stock,
          minStock: product.minStock || 0,
          unit: product.unit || 'pieza',
          barcode: product.barcode,
          isActive: product.isActive !== false,
          tags: product.tags || [],
          suppliers: [],
        });
        
        result.success++;
      } catch (error) {
        result.errors.push({ row, field: 'general', message: 'Error al crear producto', data: product });
      }
    }
    
    return result;
  };

  const handleJsonImport = async () => {
    setIsProcessing(true);
    
    try {
      const data = JSON.parse(jsonData);
      const products = data.products || data;
      const result = await processProducts(Array.isArray(products) ? products : [products]);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: 0,
        errors: [{ row: 0, field: 'json', message: 'JSON inválido', data: {} }],
        warnings: []
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addManualProduct = () => {
    setManualProducts([...manualProducts, { sku: '', name: '', price: '', cost: '', stock: '', minStock: '', unit: 'pieza' }]);
  };

  const updateManualProduct = (index: number, field: string, value: string) => {
    const updated = [...manualProducts];
    updated[index] = { ...updated[index], [field]: value };
    setManualProducts(updated);
  };

  const removeManualProduct = (index: number) => {
    setManualProducts(manualProducts.filter((_, i) => i !== index));
  };

  const handleManualImport = async () => {
    setIsProcessing(true);
    
    const products = manualProducts
      .filter(p => p.sku && p.name)
      .map(p => ({
        sku: p.sku,
        name: p.name,
        price: parseFloat(p.price) || 0,
        cost: parseFloat(p.cost) || 0,
        stock: parseInt(p.stock) || 0,
        minStock: parseInt(p.minStock) || 0,
        unit: p.unit,
        isActive: true
      }));
    
    const result = await processProducts(products);
    setImportResult(result);
    setIsProcessing(false);
  };

  const resetModal = () => {
    setImportResult(null);
    setJsonData('');
    setManualProducts([{ sku: '', name: '', price: '', cost: '', stock: '', minStock: '', unit: 'pieza' }]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetModal();
      }}
      title="Importar Productos"
      size="xl"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'file'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Archivo
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Manual
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'api'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            JSON/API
          </button>
        </div>

        {/* Resultados de importación */}
        {importResult && (
          <Card className="border-l-4 border-l-primary-500">
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <h3 className="font-semibold text-gray-900">Resultado de Importación</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">{importResult.success}</div>
                  <div className="text-sm text-gray-500">Exitosos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-error-600">{importResult.errors.length}</div>
                  <div className="text-sm text-gray-500">Errores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">{importResult.warnings.length}</div>
                  <div className="text-sm text-gray-500">Advertencias</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-error-700 mb-2">Errores:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-error-600 bg-error-50 p-2 rounded">
                        Fila {error.row}: {error.message} ({error.field})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-warning-700 mb-2">Advertencias:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-warning-600 bg-warning-50 p-2 rounded">
                        Fila {warning.row}: {warning.message} ({warning.field})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contenido por tab */}
        {activeTab === 'file' && (
          <div className="space-y-6">
            {/* Plantillas */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Descargar Plantillas</h3>
                <p className="text-sm text-gray-600">
                  Descarga una plantilla para estructurar tus datos correctamente
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => downloadTemplate('csv')}
                    icon={FileText}
                    className="justify-start"
                  >
                    Plantilla CSV
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => downloadTemplate('excel')}
                    icon={FileSpreadsheet}
                    className="justify-start"
                  >
                    Plantilla Excel
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => downloadTemplate('json')}
                    icon={Code}
                    className="justify-start"
                  >
                    Plantilla JSON
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Área de carga */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Cargar Archivo</h3>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Formatos soportados: CSV, Excel (.xlsx), JSON
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    loading={isProcessing}
                  >
                    Seleccionar Archivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Ingreso Manual</h3>
              <Button onClick={addManualProduct} size="sm">
                Agregar Producto
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4">
              {manualProducts.map((product, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium text-gray-900">Producto {index + 1}</h4>
                    {manualProducts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeManualProduct(index)}
                        icon={X}
                        className="text-error-600"
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      label="SKU *"
                      value={product.sku}
                      onChange={(e) => updateManualProduct(index, 'sku', e.target.value)}
                      placeholder="PROD-001"
                    />
                    <Input
                      label="Nombre *"
                      value={product.name}
                      onChange={(e) => updateManualProduct(index, 'name', e.target.value)}
                      placeholder="Nombre del producto"
                    />
                    <Input
                      label="Precio *"
                      type="number"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => updateManualProduct(index, 'price', e.target.value)}
                      placeholder="0.00"
                    />
                    <Input
                      label="Costo"
                      type="number"
                      step="0.01"
                      value={product.cost}
                      onChange={(e) => updateManualProduct(index, 'cost', e.target.value)}
                      placeholder="0.00"
                    />
                    <Input
                      label="Stock"
                      type="number"
                      value={product.stock}
                      onChange={(e) => updateManualProduct(index, 'stock', e.target.value)}
                      placeholder="0"
                    />
                    <Input
                      label="Stock Mínimo"
                      type="number"
                      value={product.minStock}
                      onChange={(e) => updateManualProduct(index, 'minStock', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleManualImport}
                disabled={isProcessing || !manualProducts.some(p => p.sku && p.name)}
                loading={isProcessing}
              >
                Importar Productos
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Importar desde JSON</h3>
                <p className="text-sm text-gray-600">
                  Pega tu JSON o datos de API en el formato correcto
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datos JSON
                    </label>
                    <textarea
                      value={jsonData}
                      onChange={(e) => setJsonData(e.target.value)}
                      placeholder={JSON.stringify(jsonTemplate, null, 2)}
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="secondary"
                      onClick={() => setJsonData(JSON.stringify(jsonTemplate, null, 2))}
                    >
                      Usar Ejemplo
                    </Button>
                    <Button
                      onClick={handleJsonImport}
                      disabled={isProcessing || !jsonData.trim()}
                      loading={isProcessing}
                    >
                      Importar JSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  );
};