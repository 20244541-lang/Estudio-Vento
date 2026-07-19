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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => clientService.create(data as any), // Cast to any to bypass strict type for now
    onSuccess: () => onClose(true),
    onError: (err: any) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => clientService.update(client.id, data as any),
    onSuccess: () => onClose(true),
    onError: (err: any) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('documentId', formData.documentId);
    if (formData.email) payload.append('email', formData.email);
    if (formData.phone) payload.append('phone', formData.phone);
    if (formData.address) payload.append('address', formData.address);
    if (formData.observations) payload.append('observations', formData.observations);
    
    if (selectedFile) {
      payload.append('dniPhoto', selectedFile);
    }
    
    if (client?.id) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-foreground mb-1">Foto o PDF del DNI (Opcional)</label>
              <div className="mt-1 flex items-center relative group">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary hover:file:text-primary-foreground transition-all cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
              {client?.dniPhotoUrl && !selectedFile && (
                <p className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">
                  Este cliente ya tiene un documento adjunto. Subir uno nuevo lo reemplazará.
                </p>
              )}
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
