import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, CalendarDays, MapPin, CheckCheck, Clock, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { hearingService } from '../../../services/subCaseServices';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  HELD: { label: 'Realizada', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  POSTPONED: { label: 'Postergada', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

/** Convierte el valor de un <input datetime-local> a un ISO string con offset de zona horaria local.
 *  Ejemplo: "2026-07-29T11:00"  →  "2026-07-29T11:00:00-05:00"  (si el navegador está en Lima UTC-5)
 *  Esto evita que el servidor interprete la hora como UTC y la desplace 5 horas.
 */
function localDatetimeToISOWithOffset(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return '';
  const date = new Date(datetimeLocalValue);
  const tzOffset = -date.getTimezoneOffset(); // en minutos, positivo para UTC-5 → -(-300) = 300
  const sign = tzOffset >= 0 ? '+' : '-';
  const abs = Math.abs(tzOffset);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  // Formato: YYYY-MM-DDTHH:mm:ss±HH:mm
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00${sign}${hh}:${mm}`
  );
}

export default function HearingsTab({ caseId }: { caseId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    concept: '',
    scheduledAt: '',
    location: '',
    notes: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: hearings, isLoading, refetch } = useQuery({
    queryKey: ['case-hearings', caseId],
    queryFn: () => hearingService.getByCaseId(caseId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => hearingService.create(caseId, data),
    onSuccess: () => {
      setIsFormOpen(false);
      setShowConfirm(false);
      setErrorMsg('');
      setFormData({ type: '', concept: '', scheduledAt: '', location: '', notes: '' });
      refetch();
    },
    onError: (err: any) => {
      setShowConfirm(false);
      setErrorMsg(err?.message || 'Ocurrió un error al guardar la audiencia. Inténtalo de nuevo.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      hearingService.updateStatus(id, status),
    onSuccess: () => refetch(),
    onError: () => alert('Error al actualizar el estado. Inténtalo de nuevo.'),
  });

  const deleteMutation = useMutation({
    mutationFn: hearingService.delete,
    onSuccess: () => refetch(),
    onError: () => alert('Error al eliminar la audiencia. Inténtalo de nuevo.'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta audiencia? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    const scheduledAtFixed = localDatetimeToISOWithOffset(formData.scheduledAt);
    createMutation.mutate({ ...formData, scheduledAt: scheduledAtFixed });
  };

  const previewDate = formData.scheduledAt
    ? new Date(formData.scheduledAt).toLocaleDateString('es-PE', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';
  const previewTime = formData.scheduledAt
    ? new Date(formData.scheduledAt).toLocaleTimeString('es-PE', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : '';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">Audiencias</h3>
        <Button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setShowConfirm(false);
            setErrorMsg('');
          }}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" /> {isFormOpen ? 'Cancelar' : 'Nueva Audiencia'}
        </Button>
      </div>

      {isFormOpen && !showConfirm && (
        <form onSubmit={handleFormSubmit} className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de Audiencia <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Audiencia Única, Conciliación..."
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
              {formData.scheduledAt && (
                <p className="text-xs text-primary mt-1 font-medium">
                  ✓ Se guardará como: {previewDate} a las {previewTime}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción / Concepto <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Primera audiencia de juzgamiento..."
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
                placeholder="Ej: Sala 3 — Juzgado..."
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

          {errorMsg && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit">
              Continuar y Confirmar →
            </Button>
          </div>
        </form>
      )}

      {isFormOpen && showConfirm && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg flex-shrink-0">
              <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-base">Confirmar Audiencia</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Revisa los datos antes de guardar.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-card border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                {formData.type}
              </span>
              <span className="text-xs text-muted-foreground">Estado: Pendiente</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground capitalize">{previewDate}</p>
                <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">{previewTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-foreground">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p>{formData.concept}</p>
            </div>
            {formData.location && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{formData.location}</p>
              </div>
            )}
            {formData.notes && (
              <p className="text-xs text-muted-foreground italic pl-6">{formData.notes}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={createMutation.isPending}
            >
              ← Volver a editar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Confirmar y Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando audiencias...</div>
      ) : !hearings || hearings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No hay audiencias registradas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hearings?.map((hearing: any) => {
            const statusInfo = STATUS_MAP[hearing.status] || STATUS_MAP.PENDING;
            return (
              <div key={hearing.id} className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-start gap-4 relative shadow-sm">
                <button
                  onClick={() => handleDelete(hearing.id)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                  title="Eliminar audiencia"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex-shrink-0 bg-primary/10 rounded-lg p-3 text-center min-w-[80px]">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    {new Date(hearing.scheduledAt).toLocaleDateString('es-PE', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-bold text-primary leading-none">
                    {new Date(hearing.scheduledAt).getDate()}
                  </p>
                  <p className="text-xs font-semibold text-primary/80 mt-0.5">
                    {new Date(hearing.scheduledAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
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
                {hearing.status === 'PENDING' && (
                  <div className="flex flex-shrink-0 gap-1 flex-wrap md:flex-col">
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: hearing.id, status: 'HELD' })}
                      className="flex items-center text-xs px-2 py-1 rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" /> Realizada
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: hearing.id, status: 'POSTPONED' })}
                      className="flex items-center text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Postergada
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: hearing.id, status: 'CANCELLED' })}
                      className="flex items-center text-xs px-2 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="h-3 w-3 mr-1" /> Cancelar
                    </button>
                  </div>
                )}
                {hearing.status !== 'PENDING' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: hearing.id, status: 'PENDING' })}
                    className="flex-shrink-0 flex items-center text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
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
