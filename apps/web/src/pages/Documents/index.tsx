import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Clock, Search, FolderOpen } from 'lucide-react';
import { documentService } from '../../services/subCaseServices';

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['all-documents'],
    queryFn: () => documentService.getAll(),
  });

  const filteredDocuments = documents?.filter((doc: any) => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.action?.case?.docketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.action?.case?.internalNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestor Documental</h1>
          <p className="text-sm text-muted-foreground">Todos los archivos adjuntos de todos tus expedientes.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o expediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Cargando documentos...
        </div>
      ) : filteredDocuments?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-card/50">
          <FolderOpen className="h-16 w-16 mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">No se encontraron documentos</p>
          <p className="text-sm mt-1">Sube archivos a las actuaciones de tus casos para verlos aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocuments?.map((doc: any) => (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-all group shadow-sm">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${doc.type.includes('pdf') ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-muted rounded-md text-muted-foreground border border-border/50">
                    {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                
                <h4 className="font-semibold text-foreground text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors" title={doc.name}>
                  {doc.name}
                </h4>
                
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <FolderOpen className="h-3.5 w-3.5 mr-2 text-primary/70" />
                    <span className="truncate">
                      Exp. {doc.action?.case?.docketNumber || doc.action?.case?.internalNumber}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-2" />
                    {new Date(doc.createdAt).toLocaleDateString()} por {doc.author?.name}
                  </div>
                </div>
              </div>
              
              <a 
                href={doc.storageUrl?.startsWith('http') ? doc.storageUrl : `https://estudio-vento.onrender.com${doc.storageUrl}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Archivo
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
