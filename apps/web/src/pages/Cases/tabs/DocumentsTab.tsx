import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Clock, Search, Upload, Loader2 } from 'lucide-react';
import { actionService, documentService } from '../../../services/subCaseServices';
import { Button } from '../../../components/ui/button';

export default function DocumentsTab({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: actions, isLoading: isLoadingActions } = useQuery({
    queryKey: ['case-actions', caseId],
    queryFn: () => actionService.getByCaseId(caseId),
  });

  const { data: standaloneDocs, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['case-standalone-docs', caseId],
    queryFn: () => documentService.getByCaseId(caseId),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => documentService.createForCase(caseId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-standalone-docs', caseId] });
      setIsUploading(false);
    },
    onError: () => {
      alert('Error al subir el documento. Por favor intente de nuevo.');
      setIsUploading(false);
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    uploadMutation.mutate(formData);
    
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Aplanar documentos de actuaciones
  const actionDocuments = actions?.reduce((acc: any[], action: any) => {
    if (action.documents && action.documents.length > 0) {
      const docsWithActionData = action.documents.map((doc: any) => ({
        ...doc,
        actionType: action.type,
        actionDate: action.date,
      }));
      return [...acc, ...docsWithActionData];
    }
    return acc;
  }, []) || [];

  // Mapear documentos sueltos
  const standaloneDocumentsMapped = standaloneDocs?.map((doc: any) => ({
    ...doc,
    actionType: 'Documento Libre',
    actionDate: doc.createdAt,
  })) || [];

  // Unir ambos
  const allDocuments = [...standaloneDocumentsMapped, ...actionDocuments].sort((a, b) => 
    new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
  );

  const isLoading = isLoadingActions || isLoadingDocs;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h3 className="text-lg font-medium text-foreground">Gestor Documental</h3>
          <p className="text-sm text-muted-foreground">Consolidado de todos los archivos adjuntos en el expediente.</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar documento..."
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          <Button onClick={handleUploadClick} disabled={isUploading} className="shrink-0">
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Subir Archivo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando documentos...</div>
      ) : allDocuments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p>No hay documentos registrados en este expediente.</p>
          <p className="text-xs mt-1">Sube tu primer documento usando el botón superior.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allDocuments.map((doc: any) => (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${doc.type.includes('pdf') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md text-muted-foreground">
                    {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <h4 className="font-medium text-foreground text-sm line-clamp-2 mb-1" title={doc.name}>
                  {doc.name}
                </h4>
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <Clock className="h-3 w-3 mr-1" />
                  Subido en: {doc.actionType} ({new Date(doc.actionDate).toLocaleDateString()})
                </div>
              </div>
              <a 
                href={doc.storageUrl?.startsWith('http') ? doc.storageUrl : `https://estudio-vento.onrender.com${doc.storageUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
