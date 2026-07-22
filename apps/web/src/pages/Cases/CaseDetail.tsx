import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, Trash2, Calendar, Paperclip, DollarSign, ListTodo, FileText, AlertCircle, Bookmark, Gavel } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../services/caseService';
import ActionsTab from './tabs/ActionsTab';
import ExpensesTab from './tabs/ExpensesTab';
import DeadlinesTab from './tabs/DeadlinesTab';
import DocumentsTab from './tabs/DocumentsTab';
import HearingsTab from './tabs/HearingsTab';
import CaseEditForm from './CaseEditForm';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const { data: caseData, isLoading, refetch } = useQuery({
    queryKey: ['cases', id],
    queryFn: () => caseService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-center">Cargando expediente...</div>;
  }

  if (!caseData) {
    return <div className="p-8 text-center text-destructive">Expediente no encontrado</div>;
  }

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: FileText },
    { id: 'actuaciones', label: 'Actuaciones', icon: ListTodo },
    { id: 'audiencias', label: 'Audiencias', icon: Gavel },
    { id: 'documentos', label: 'Documentos', icon: Paperclip },
    { id: 'plazos', label: 'Plazos', icon: Calendar },
    { id: 'gastos', label: 'Gastos / Aranceles', icon: DollarSign },
  ];

  // Stats calculation
  const actionsCount = caseData.actions?.length || 0;
  const docsCount = caseData.actions?.reduce((acc: number, action: any) => acc + (action.documents?.length || 0), 0) || 0;
  const deadlinesCount = caseData.deadlines?.length || 0;
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch(priority) {
      case 'URGENT': return 'Urgente';
      case 'HIGH': return 'Alta';
      case 'MEDIUM': return 'Media';
      case 'LOW': return 'Baja';
      default: return priority;
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este expediente? Esta acción borrará permanentemente el expediente y todos sus registros asociados.')) {
      try {
        await caseService.delete(id!);
        navigate('/cases');
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Hubo un error al eliminar el expediente. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div>
      {/* Cabecera del Caso */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <button 
            onClick={() => navigate('/cases')}
            className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver a expedientes
          </button>
          <h1 className="text-2xl font-bold text-foreground flex items-center flex-wrap gap-2">
            Exp. {caseData.internalNumber}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${caseData.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {caseData.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(caseData.priority)}`}>
              Prioridad {getPriorityLabel(caseData.priority)}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Cliente: <span className="font-medium text-foreground">{caseData.client?.name}</span> | 
            Categoría: {caseData.specialty?.name || 'General'}
            {caseData.tags && caseData.tags.length > 0 && <span className="font-medium text-primary ml-1">— {caseData.tags[0]}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                  ${activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
                `}
              >
                <Icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Contenido de Tabs */}
      <div className="bg-card shadow-soft rounded-xl border border-border p-6 min-h-[400px]">
        {activeTab === 'resumen' && (
          <div className="space-y-8">
            {/* Tarjetas de Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex items-center">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <ListTodo className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actuaciones</p>
                  <h3 className="text-2xl font-bold text-foreground">{actionsCount}</h3>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-4 flex items-center">
                <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-4">
                  <Paperclip className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documentos Adjuntos</p>
                  <h3 className="text-2xl font-bold text-foreground">{docsCount}</h3>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-100 dark:bg-orange-900/20 dark:border-orange-800 rounded-lg p-4 flex items-center">
                <div className="bg-orange-100 dark:bg-orange-800 p-3 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plazos Registrados</p>
                  <h3 className="text-2xl font-bold text-foreground">{deadlinesCount}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna Izquierda */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center mb-3">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    Descripción del Problema Legal
                  </h3>
                  <div className="bg-muted/30 border border-border p-4 rounded-lg">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {caseData.description || 'No hay descripción registrada.'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center mb-3">
                    <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                    Observaciones Estratégicas
                  </h3>
                  <div className="bg-muted/30 border border-border p-4 rounded-lg">
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                      {caseData.observations || 'Sin observaciones registradas. (Usa el botón Editar para añadir notas internas)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground flex items-center border-b border-border pb-2">
                  <Bookmark className="h-5 w-5 mr-2 text-primary" />
                  Datos del Expediente
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">N° Expediente Judicial</span>
                    <span className="text-sm font-semibold text-foreground">{caseData.docketNumber || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Entidad / Juzgado</span>
                    <span className="text-sm font-semibold text-foreground">{caseData.entity?.name || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Categoría Principal</span>
                    <span className="text-sm font-semibold text-foreground">{caseData.specialty?.name || 'General'}</span>
                  </div>

                  {caseData.tags && caseData.tags.length > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">Materia Específica</span>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{caseData.tags[0]}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</span>
                    <span className="text-sm font-semibold text-foreground">
                      {caseData.startDate ? new Date(caseData.startDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  {caseData.status === 'CLOSED' && (
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm font-medium text-muted-foreground">Fecha de Cierre</span>
                      <span className="text-sm font-semibold text-green-600">
                        {caseData.closeDate ? new Date(caseData.closeDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fila Inferior: Últimas Actuaciones */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center">
                  <ListTodo className="h-5 w-5 mr-2 text-primary" />
                  Últimas Actuaciones
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('actuaciones')}>
                  Ver Todas
                </Button>
              </div>
              
              {(!caseData.actions || caseData.actions.length === 0) ? (
                <div className="bg-muted/30 border border-border p-6 rounded-lg text-center text-muted-foreground text-sm">
                  Aún no hay actuaciones (demandas, escritos, etc.) registradas en este expediente.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {caseData.actions.slice(0, 3).map((action: any) => (
                    <div key={action.id} className="bg-card border border-border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                          {action.type}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(action.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 mt-2">
                        {action.description || 'Sin descripción'}
                      </p>
                      {action.documents && action.documents.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center text-xs text-muted-foreground">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {action.documents.length} adjunto(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'actuaciones' && <ActionsTab caseId={id!} />}
        {activeTab === 'audiencias' && <HearingsTab caseId={id!} />}
        {activeTab === 'gastos' && <ExpensesTab caseId={id!} />}
        {activeTab === 'plazos' && <DeadlinesTab caseId={id!} />}
        {activeTab === 'documentos' && <DocumentsTab caseId={caseData.id} />}
      </div>

      {isEditFormOpen && (
        <CaseEditForm 
          caseData={caseData} 
          onClose={(shouldRefetch) => {
            setIsEditFormOpen(false);
            if (shouldRefetch) refetch();
          }} 
        />
      )}
    </div>
  );
}
