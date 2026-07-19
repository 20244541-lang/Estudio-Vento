import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Clock, FileText, Calendar, Download } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { actionService } from '../../../services/subCaseServices';

export default function ActionsTab({ caseId }: { caseId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    type: 'Escrito', 
    description: '', 
    date: '',
    generateDeadline: false,
    daysCount: '',
    daysType: 'HABILE',
    dueDate: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: actions, isLoading, refetch } = useQuery({
    queryKey: ['case-actions', caseId],
    queryFn: () => actionService.getByCaseId(caseId),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => actionService.create(caseId, data),
    onSuccess: () => {
      setIsFormOpen(false);
      setFormData({ type: 'Escrito', description: '', date: '', generateDeadline: false, daysCount: '', daysType: 'HABILE', dueDate: '' });
      setFile(null);
      refetch();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: actionService.delete,
    onSuccess: () => refetch()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('type', formData.type);
    submitData.append('description', formData.description);
    submitData.append('date', formData.date);
    
    if (formData.generateDeadline) {
      submitData.append('generateDeadline', 'true');
      submitData.append('daysCount', formData.daysCount);
      submitData.append('daysType', formData.daysType);
      submitData.append('dueDate', formData.dueDate);
    }
    
    if (file) {
      submitData.append('file', file);
    }

    createMutation.mutate(submitData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">Actuaciones Procesales</h3>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> {isFormOpen ? 'Cancelar' : 'Nueva Actuación'}
        </Button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select 
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="Demanda">Demanda</option>
                <option value="Contestación">Contestación</option>
                <option value="Escrito">Escrito</option>
                <option value="Resolución">Resolución</option>
                <option value="Audiencia">Audiencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha</label>
              <input 
                type="date" 
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción / Sumilla</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="border-t border-border pt-4">
            <label className="block text-sm font-medium mb-1">Documento Adjunto (Opcional)</label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center mb-3">
              <input 
                type="checkbox" 
                id="generateDeadline"
                className="rounded border-input text-primary focus:ring-primary mr-2"
                checked={formData.generateDeadline}
                onChange={e => setFormData({...formData, generateDeadline: e.target.checked})}
              />
              <label htmlFor="generateDeadline" className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Generar plazo de vencimiento automáticamente
              </label>
            </div>
            
            {formData.generateDeadline && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-3 rounded-md border border-border">
                <div>
                  <label className="block text-xs font-medium mb-1">Días</label>
                  <input 
                    type="number" 
                    required={formData.generateDeadline}
                    className="w-full px-2 py-1 text-sm rounded-md border border-input bg-transparent"
                    value={formData.daysCount}
                    onChange={e => setFormData({...formData, daysCount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tipo</label>
                  <select 
                    className="w-full px-2 py-1 text-sm rounded-md border border-input bg-transparent"
                    value={formData.daysType}
                    onChange={e => setFormData({...formData, daysType: e.target.value})}
                  >
                    <option value="HABILE">Hábiles</option>
                    <option value="CALENDARIO">Calendario</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Vencimiento</label>
                  <input 
                    type="date" 
                    required={formData.generateDeadline}
                    className="w-full px-2 py-1 text-sm rounded-md border border-input bg-transparent"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={createMutation.isPending}>Guardar Actuación</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando actuaciones...</div>
      ) : actions?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          No hay actuaciones registradas en este expediente.
        </div>
      ) : (
        <div className="relative border-l-2 border-border ml-3 md:ml-6 space-y-8 py-4">
          {actions?.map((action: any) => (
            <div key={action.id} className="relative pl-8 md:pl-10">
              <div className="absolute -left-[11px] top-1 bg-card rounded-full border-2 border-primary p-1">
                <FileText className="h-3 w-3 text-primary" />
              </div>
              <div className="bg-card border border-border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-foreground">{action.type}</span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(action.date).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteMutation.mutate(action.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-foreground mb-3">{action.description}</p>
                
                {action.documents && action.documents.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-col space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documentos Adjuntos</span>
                    {action.documents.map((doc: any) => (
                      <a 
                        key={doc.id}
                        href={doc.storageUrl?.startsWith('http') ? doc.storageUrl : `https://estudio-vento.onrender.com${doc.storageUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-primary hover:text-blue-700 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors w-fit"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar {doc.name.length > 25 ? doc.name.substring(0, 25) + '...' : doc.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
