import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, Trash2, Calendar, Paperclip, DollarSign, ListTodo, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { caseService } from '../../services/caseService';
import ActionsTab from './tabs/ActionsTab';
import ExpensesTab from './tabs/ExpensesTab';
import DeadlinesTab from './tabs/DeadlinesTab';
import DocumentsTab from './tabs/DocumentsTab';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');

  const { data: caseData, isLoading } = useQuery({
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
    { id: 'documentos', label: 'Documentos', icon: Paperclip },
    { id: 'plazos', label: 'Plazos', icon: Calendar },
    { id: 'gastos', label: 'Gastos / Aranceles', icon: DollarSign },
  ];

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
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            Exp. {caseData.internalNumber}
            <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${caseData.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {caseData.status === 'OPEN' ? 'Abierto' : 'Cerrado'}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Cliente: <span className="font-medium text-foreground">{caseData.client?.name}</span> | 
            Especialidad: {caseData.specialty?.name || 'General'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Editar</Button>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Descripción del Problema Legal</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{caseData.description || 'No hay descripción registrada.'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">N° Expediente Judicial</h4>
                <p className="text-muted-foreground">{caseData.docketNumber || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Entidad / Juzgado</h4>
                <p className="text-muted-foreground">{caseData.entity?.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actuaciones' && <ActionsTab caseId={id!} />}
        {activeTab === 'gastos' && <ExpensesTab caseId={id!} />}
        {activeTab === 'plazos' && <DeadlinesTab caseId={id!} />}
        {activeTab === 'documentos' && <DocumentsTab caseId={caseData.id} />}
      </div>
    </div>
  );
}
