import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { expenseService } from '../../../services/subCaseServices';

export default function ExpensesTab({ caseId }: { caseId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', date: '', status: 'PENDING' });

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ['case-expenses', caseId],
    queryFn: () => expenseService.getByCaseId(caseId),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => expenseService.create(caseId, data),
    onSuccess: () => {
      setIsFormOpen(false);
      setFormData({ description: '', amount: '', date: '', status: 'PENDING' });
      refetch();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => refetch()
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => expenseService.updateStatus(id, status),
    onSuccess: () => refetch()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const totalExpenses = expenses?.reduce((acc: number, exp: any) => acc + exp.amount, 0) || 0;
  const pendingExpenses = expenses?.filter((e: any) => e.status === 'PENDING').reduce((acc: number, exp: any) => acc + exp.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h3 className="text-lg font-medium text-foreground">Control de Gastos y Aranceles</h3>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> {isFormOpen ? 'Cancelar' : 'Registrar Gasto'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Total Gastos (S/)</p>
          <p className="text-2xl font-bold text-foreground">S/ {totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-900">
          <p className="text-sm text-orange-600 dark:text-orange-400">Total Pendiente</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">S/ {pendingExpenses.toFixed(2)}</p>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monto (S/)</label>
              <input 
                type="number" 
                step="0.01"
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
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
            <label className="block text-sm font-medium mb-1">Descripción (Concepto)</label>
            <input 
              type="text" 
              required
              className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={createMutation.isPending}>Guardar Gasto</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando gastos...</div>
      ) : expenses?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          No hay gastos registrados en este expediente.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Concepto</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Fecha</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Monto</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {expenses?.map((exp: any) => (
              <tr key={exp.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">{exp.description}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-right">S/ {exp.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => updateStatusMutation.mutate({ id: exp.id, status: exp.status === 'PENDING' ? 'PAID' : 'PENDING' })}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${exp.status === 'PAID' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-orange-100 text-orange-800 hover:bg-orange-200'}`}
                  >
                    {exp.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(exp.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
