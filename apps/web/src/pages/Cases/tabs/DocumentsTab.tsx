import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Clock, Search } from 'lucide-react';
import { actionService } from '../../../services/subCaseServices';

export default function DocumentsTab({ caseId }: { caseId: string }) {
  const { data: actions, isLoading } = useQuery({
    queryKey: ['case-actions', caseId],
    queryFn: () => actionService.getByCaseId(caseId),
  });

  // Aplanar todos los documentos de todas las actuaciones
  const allDocuments = actions?.reduce((acc: any[], action: any) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h3 className="text-lg font-medium text-foreground">Gestor Documental</h3>
          <p className="text-sm text-muted-foreground">Consolidado de todos los archivos adjuntos en el expediente.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documento..."
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando documentos...</div>
      ) : allDocuments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p>No hay documentos registrados en este expediente.</p>
          <p className="text-xs mt-1">Los documentos se añaden automáticamente al crear una nueva Actuación.</p>
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
                href={doc.storageUrl?.startsWith('http') ? doc.storageUrl : `http://localhost:3000${doc.storageUrl}`} 
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
