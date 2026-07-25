import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Filter, Trash2, Upload, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../../store/authStore';

const API_URL = 'https://estudio-vento.onrender.com/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { accessToken } = useAuthStore.getState();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (response.status === 204) return null;
  return response.json();
}

const templateService = {
  getAll: () => fetchWithAuth('/templates'),
  delete: (id: string) => fetchWithAuth(`/templates/${id}`, { method: 'DELETE' }),
};

const CATEGORIES = ['Todos', 'General', 'Familia', 'Laboral', 'Civil', 'Penal'];

const CATEGORY_COLORS: Record<string, string> = {
  General: 'bg-gray-100 text-gray-700',
  Familia: 'bg-pink-100 text-pink-700',
  Laboral: 'bg-blue-100 text-blue-700',
  Civil: 'bg-green-100 text-green-700',
  Penal: 'bg-red-100 text-red-700',
};

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: templateService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templateService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  const filteredTemplates = activeCategory === 'Todos'
    ? templates
    : templates.filter((t: any) => t.category === activeCategory);

  return (
    <div>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plantillas</h1>
          <p className="text-muted-foreground mt-1">
            Administra tus modelos de documentos (demandas, contratos, escritos).
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Subir Plantilla
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        <Filter className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
        {CATEGORIES.map(cat => (
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
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando plantillas...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <FileText className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-lg font-medium text-foreground">No hay plantillas</p>
            <p className="text-sm mt-1">Sube tu primera plantilla con el botón "Subir Plantilla".</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Especialidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Formato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tamaño</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subido</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredTemplates.map((template: any) => (
                <tr key={template.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="flex-shrink-0 h-5 w-5 text-primary mr-3" />
                      <span className="text-sm font-medium text-foreground">{template.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[template.category] || 'bg-gray-100 text-gray-700'}`}>
                      {template.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{template.format}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {(template.sizeBytes / 1024).toFixed(0)} KB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(template.createdAt).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={template.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1.5" /> Descargar
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive ml-1"
                      onClick={() => {
                        if (confirm(`¿Eliminar la plantilla "${template.name}"?`)) {
                          deleteMutation.mutate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Subir Plantilla */}
      {isUploadOpen && (
        <UploadTemplateModal
          accessToken={accessToken!}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setIsUploadOpen(false);
          }}
        />
      )}
    </div>
  );
}

function UploadTemplateModal({ accessToken, onClose, onSuccess }: {
  accessToken: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Selecciona un archivo'); return; }
    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);
    formData.append('category', category);

    try {
      const response = await fetch(`${API_URL}/templates`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al subir');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Subir Plantilla</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre de la plantilla</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Demanda de Alimentos"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Especialidad</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {['General', 'Familia', 'Laboral', 'Civil', 'Penal'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Archivo (DOCX, PDF, etc.)</label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Haz clic para seleccionar un archivo</p>
                  <p className="text-xs text-muted-foreground mt-1">DOCX, PDF, ODT, etc.</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isUploading}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={isUploading || !file}>
              {isUploading ? 'Subiendo...' : 'Subir Plantilla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
