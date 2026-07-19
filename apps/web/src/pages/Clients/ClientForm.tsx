import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { clientService } from '../../services/clientService';

interface ClientFormProps {
  client?: any;
  onClose: (shouldRefetch: boolean) => void;
}

export default function ClientForm({ client, onClose }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    documentId: client?.documentId || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    observations: client?.observations || '',
  });

  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: clientService.create,
    onSuccess: () => onClose(true),
    onError: (err: any) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => clientService.update(client.id, data),
    onSuccess: () => onClose(true),
    onError: (err: any) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (client?.id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {client?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button onClick={() => onClose(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-destructive">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nombre Completo o Razón Social *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">DNI / RUC *</label>
              <input
                type="text"
                name="documentId"
                required
                value={formData.documentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Foto del DNI (Opcional)</label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => {
                    // Simulación de carga (aquí iría la lógica para subir a AWS/Drive)
                    console.log("Archivo seleccionado:", e.target.files?.[0]);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Observaciones</label>
            <textarea
              name="observations"
              rows={3}
              value={formData.observations}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
