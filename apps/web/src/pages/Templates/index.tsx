import { useState } from 'react';
import { FileText, Download, Plus, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const templates = [
    { id: 1, name: 'Demanda de Alimentos Básica', category: 'Familia', format: 'DOCX', date: '10/07/2026' },
    { id: 2, name: 'Contestación de Demanda (Laboral)', category: 'Laboral', format: 'DOCX', date: '12/07/2026' },
    { id: 3, name: 'Recurso de Apelación Estándar', category: 'General', format: 'DOCX', date: '15/07/2026' },
    { id: 4, name: 'Contrato de Arrendamiento Comercial', category: 'Civil', format: 'DOCX', date: '01/07/2026' },
    { id: 5, name: 'Medida Cautelar Fuera de Proceso', category: 'General', format: 'DOCX', date: '20/06/2026' },
  ];

  const categories = ['Todos', 'General', 'Familia', 'Laboral', 'Civil', 'Penal'];

  const filteredTemplates = activeCategory === 'Todos' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plantillas</h1>
          <p className="text-muted-foreground mt-1">
            Administra tus modelos de documentos (demandas, contratos, escritos).
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Subir Plantilla
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        <Filter className="h-5 w-5 text-muted-foreground mr-2" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-card text-muted-foreground hover:bg-muted border border-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-card shadow-soft rounded-xl border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nombre de Plantilla
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Especialidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Formato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actualizado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredTemplates.map((template) => (
              <tr key={template.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="flex-shrink-0 h-5 w-5 text-primary mr-3" />
                    <span className="text-sm font-medium text-foreground">{template.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {template.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {template.format}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {template.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-blue-900">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
