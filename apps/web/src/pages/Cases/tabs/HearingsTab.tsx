import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, CalendarDays, MapPin, CheckCheck, Clock, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { hearingService } from '../../../services/subCaseServices';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  HELD: { label: 'Realizada', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  POSTPONED: { label: 'Postergada', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

export default function HearingsTab({ caseId }: { caseId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    concept: '',
    scheduledAt: '',
    location: '',
    notes: '',
  });

  const { data: hearings, isLoading, refetch } = useQuery({
    queryKey: ['case-hearings', caseId],
    queryFn: () => hearingService.getByCaseId(caseId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => hearingService.create(caseId, data),
    onSuccess: () => {
      setIsFormOpen(false);
      setFormData({ type: '', concept: '', scheduledAt: '', location: '', notes: '' });
      refetch();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      hearingService.updateStatus(id, status),
    onSuccess: () => refetch(),
  });

  const deleteMutation = useMutation({
    mutationFn: hearingService.delete,
    onSuccess: () => refetch()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">Audiencias</h3>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> {isFormOpen ? 'Cancelar' : 'Nueva Audiencia'}
        </Button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de Audiencia <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Audiencia Única, Conciliación, Pruebas..."
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha y Hora <span className="text-destructive">*</span>
              </label>
              <input
                type="datetime-local"
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                value={formData.scheduledAt}
                onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción / Concepto <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Primera audiencia de juzgamiento por reposición laboral"
              className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              value={formData.concept}
              onChange={e => setFormData({ ...formData, concept: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lugar / Sala (Opcional)</label>
              <input
                type="text"
                placeholder="Ej: Sala 3 — Juzgado Laboral de Lima"
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notas (Opcional)</label>
              <input
                type="text"
                placeholder="Observaciones internas..."
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Guardar Audiencia'}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando audiencias...</div>
      ) : !hearings || hearings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No hay audiencias registradas en este expediente.</p>
          <p className="text-xs mt-1">Usa el botón "Nueva Audiencia" para registrar una.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hearings?.map((hearing: any) => {
            const statusInfo = STATUS_MAP[hearing.status] || STATUS_MAP.PENDING;

            return (
              <div key={hearing.id} className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-start gap-4 relative shadow-sm">
                {/* Eliminar */}
                <button
                  onClick={() => deleteMutation.mutate(hearing.id)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                  title="Eliminar audiencia"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Fecha/hora columna */}
                <div className="flex-shrink-0 bg-primary/10 rounded-lg p-3 text-center min-w-[80px]">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {new Date(hearing.scheduledAt).toLocaleDateString('es-PE', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-bold text-primary leading-none">
                    {new Date(hearing.scheduledAt).getDate()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(hearing.scheduledAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Contenido */}
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {hearing.type}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{hearing.concept}</p>
                  {hearing.location && (
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" /> {hearing.location}
                    </p>
                  )}
                  {hearing.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{hearing.notes}</p>
                  )}
                </div>

                {/* Botones de estado */}
                {hearing.status === 'PENDING' && (
                  <div className="flex flex-shrink-0 gap-1 flex-wrap md:flex-col">
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: hearing.id, status: 'HELD' })}
                      className="flex items-center text-xs px-2 py-1 rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                      title="Marcar como realizada"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" /> Realizada
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: hearing.id, status: 'POSTPONED' })}
                      className="flex items-center text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                      title="Marcar como postergada"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Postergada
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: hearing.id, status: 'CANCELLED' })}
                      className="flex items-center text-xs px-2 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                      title="Cancelar audiencia"
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Cancelar
                    </button>
                  </div>
                )}
                {hearing.status !== 'PENDING' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: hearing.id, status: 'PENDING' })}
                    className="flex-shrink-0 flex items-center text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    title="Restaurar a pendiente"
                  >
                    <Clock className="h-3 w-3 mr-1" /> Restaurar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
