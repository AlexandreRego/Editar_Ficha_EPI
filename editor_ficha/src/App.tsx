import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  Trash2, 
  Copy, 
  Save, 
  Download, 
  Upload, 
  ShieldCheck, 
  Briefcase, 
  History, 
  Sparkles,
  Eye,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  X,
  FileDown,
  RotateCcw
} from 'lucide-react';
import { EPIDeclaration, EPIItem, EPITemplate } from './types';
import { COMMON_EPIS, FUNCTION_TEMPLATES, INITIAL_DECLARATION_MOCK } from './data';
import { EPIDocument } from './components/EPIDocument';
import { PneuBrasLogo } from './components/PneuBrasLogo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

// Helper to get local date string (YYYY-MM-DD) safely avoiding timezone shifts
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  // State for declarations
  const [declarations, setDeclarations] = useState<EPIDeclaration[]>([]);
  const [currentId, setCurrentId] = useState<string>('');
  
  // App view controls
  const [activeTab, setActiveTab] = useState<'edit' | 'list' | 'catalog' | 'config'>('edit');
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Catalog customization states
  const [catalog, setCatalog] = useState<EPITemplate[]>(COMMON_EPIS);
  const [newCatalogItem, setNewCatalogItem] = useState<EPITemplate>({
    codigo: '',
    descricao: '',
    un: 'UN',
    codCa: ''
  });
  const [showCatalogAdd, setShowCatalogAdd] = useState(false);

  // Custom Logo and Drag State
  const [customLogo, setCustomLogo] = useState<string | null>(() => localStorage.getItem('pneubras_custom_logo'));
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  // In-app Notification toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Logo upload and conversion to base64
  const handleLogoUpload = (file: File) => {
    if (!file) return;
    
    // Validate that it's an image
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione uma imagem válida (PNG, JPG ou SVG).', 'error');
      return;
    }
    
    // Limit size to 2MB to keep localStorage happy
    if (file.size > 2 * 1024 * 1024) {
      showToast('A imagem é muito grande. Escolha uma imagem de até 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64String = uploadEvent.target?.result as string;
      if (base64String) {
        setCustomLogo(base64String);
        localStorage.setItem('pneubras_custom_logo', base64String);
        showToast('Logomarca personalizada carregada com sucesso!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleDragLeave = () => {
    setIsDraggingLogo(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  // Load from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pneubras_epi_declarations');
    const storedCatalog = localStorage.getItem('pneubras_epi_catalog');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as EPIDeclaration[];
        setDeclarations(parsed);
        if (parsed.length > 0) {
          setCurrentId(parsed[0].id);
        }
      } catch (e) {
        console.error('Error parsing declarations, resetting to default', e);
        initializeDefault();
      }
    } else {
      initializeDefault();
    }

    if (storedCatalog) {
      try {
        setCatalog(JSON.parse(storedCatalog));
      } catch (e) {
        setCatalog(COMMON_EPIS);
      }
    }
  }, []);

  // Save declarations to local storage on changes
  const saveToLocalStorage = (data: EPIDeclaration[]) => {
    localStorage.setItem('pneubras_epi_declarations', JSON.stringify(data));
  };

  const initializeDefault = () => {
    const defaultData = [JSON.parse(JSON.stringify(INITIAL_DECLARATION_MOCK))];
    setDeclarations(defaultData);
    setCurrentId(defaultData[0].id);
    saveToLocalStorage(defaultData);
  };

  // Notification helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Robust print handler with support for iframe environments
  const handlePrint = () => {
    try {
      window.print();
      showToast('Abrindo visualização de impressão... (Dica: Se a tela de impressão não abrir, use o botão "Abrir em nova aba" no topo do painel)', 'info');
    } catch (e) {
      console.error('Print blocked or failed:', e);
      showToast('Impressão indisponível no modo visualizador. Clique em "Abrir em nova aba" para imprimir.', 'error');
    }
  };

  // High-fidelity client-side PDF download using html2canvas and jsPDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById('epi-document-sheet');
    if (!element) {
      showToast('Ficha de EPI não encontrada para gerar o PDF.', 'error');
      return;
    }
    
    showToast('Preparando download do PDF de alta resolução...', 'info');

    try {
      // Resolve html2canvas function handle correctly
      let html2canvasFn = html2canvas;
      if (typeof html2canvasFn !== 'function' && (html2canvasFn as any).default) {
        html2canvasFn = (html2canvasFn as any).default;
      }

      // Resolve jsPDF constructor correctly
      let JsPDFClass = jsPDF;
      if (typeof JsPDFClass !== 'function' && (JsPDFClass as any).default) {
        JsPDFClass = (JsPDFClass as any).default;
      }

      // Use html2canvas to render the high fidelity sheet to canvas
      const canvas = await (html2canvasFn as any)(element, {
        scale: 2.0, // 2x scale is perfect for crisp quality on standard devices without exceeding memory limits
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Export canvas to high quality JPEG
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Create portrait A4 PDF (210mm x 297mm)
      const pdf = new (JsPDFClass as any)({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210; 
      const pdfHeight = 297; 

      // Put image onto the full A4 canvas area
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      // Build dynamic filename based on employee's name
      const employeeNameClean = currentDeclaration?.employeeName
        ? currentDeclaration.employeeName.trim().replace(/\s+/g, '_')
        : 'Declaracao';
      const filename = `EPI_${employeeNameClean}.pdf`;

      // Trigger standard browser download
      pdf.save(filename);
      showToast('Ficha de EPI baixada como PDF com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      showToast(`Erro na exportação: ${error?.message || error}. Abrindo impressão...`, 'error');
      try {
        window.print();
      } catch (printErr) {
        console.error('Print failed too:', printErr);
      }
    }
  };

  // Get current active declaration
  const currentDeclaration = declarations.find(d => d.id === currentId) || declarations[0] || null;

  // Handle text field changes in the current declaration
  const handleFieldChange = (field: keyof EPIDeclaration, value: any) => {
    if (!currentDeclaration) return;
    
    const updated = declarations.map(d => {
      if (d.id === currentDeclaration.id) {
        return {
          ...d,
          [field]: value,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    
    setDeclarations(updated);
    saveToLocalStorage(updated);
  };

  // Handle specific field changes inside EPI items
  const handleItemChange = (itemId: string, field: keyof EPIItem, value: any) => {
    if (!currentDeclaration) return;

    const updatedItems = currentDeclaration.items.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });

    const updated = declarations.map(d => {
      if (d.id === currentDeclaration.id) {
        return {
          ...d,
          items: updatedItems,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDeclarations(updated);
    saveToLocalStorage(updated);
  };

  // Add new EPI item row
  const handleAddItemRow = () => {
    if (!currentDeclaration) return;

    const newItem: EPIItem = {
      id: `item-${Date.now()}`,
      dataEntrega: new Date().toISOString().split('T')[0],
      codigo: '',
      descricao: '',
      un: 'UN',
      qtd: 1,
      codCa: ''
    };

    const updated = declarations.map(d => {
      if (d.id === currentDeclaration.id) {
        return {
          ...d,
          items: [...d.items, newItem],
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDeclarations(updated);
    saveToLocalStorage(updated);
    showToast('Nova linha de EPI adicionada!', 'info');
  };

  // Remove EPI item row
  const handleRemoveItemRow = (itemId: string) => {
    if (!currentDeclaration) return;

    const updatedItems = currentDeclaration.items.filter(item => item.id !== itemId);
    const updated = declarations.map(d => {
      if (d.id === currentDeclaration.id) {
        return {
          ...d,
          items: updatedItems,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDeclarations(updated);
    saveToLocalStorage(updated);
    showToast('Linha de EPI removida.', 'info');
  };

  // Pre-fill fields and items based on a predefined function profile
  const applyFunctionTemplate = (funcaoNome: string) => {
    if (!currentDeclaration) return;
    
    const template = FUNCTION_TEMPLATES.find(t => t.funcao === funcaoNome);
    if (!template) return;

    const confirmApply = window.confirm(`Deseja aplicar o modelo para "${funcaoNome}"? Isso substituirá a função, setor, centro de custo e adicionará os EPIs padrão.`);
    if (!confirmApply) return;

    const mappedItems: EPIItem[] = template.items.map((it, idx) => ({
      id: `item-temp-${idx}-${Date.now()}`,
      dataEntrega: new Date().toISOString().split('T')[0],
      codigo: it.codigo,
      descricao: it.descricao,
      un: it.un,
      qtd: it.qtd,
      codCa: it.codCa
    }));

    const updated = declarations.map(d => {
      if (d.id === currentDeclaration.id) {
        return {
          ...d,
          funcao: template.funcao,
          setor: template.setor,
          centroDeCusto: template.centroDeCusto,
          items: mappedItems,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDeclarations(updated);
    saveToLocalStorage(updated);
    showToast(`Modelo de "${funcaoNome}" aplicado com sucesso!`);
  };

  // Fast add EPI item from Catalog to active document
  const addEpiFromCatalog = (epi: EPITemplate) => {
    if (!currentDeclaration) return;

    const newItem: EPIItem = {
      id: `item-${Date.now()}`,
      dataEntrega: new Date().toISOString().split('T')[0],
      codigo: epi.codigo,
      descricao: epi.descricao,
      un: epi.un,
      qtd: 1,
      codCa: epi.codCa
    };

    // Find if we have an empty row to replace, otherwise append
    const emptyRowIndex = currentDeclaration.items.findIndex(it => !it.codigo && !it.descricao);
    let updatedItems = [...currentDeclaration.items];

    if (emptyRowIndex !== -1) {
      updatedItems[emptyRowIndex] = newItem;
    } else {
      updatedItems.push(newItem);
    }

    const updated = declarations.map(d => {
      if (d.id === currentDeclaration.id) {
        return {
          ...d,
          items: updatedItems,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    setDeclarations(updated);
    saveToLocalStorage(updated);
    showToast(`Adicionado: ${epi.descricao}`);
  };

  // Create a brand new blank declaration
  const handleCreateNew = () => {
    const random6DigitNum = Math.floor(100000 + Math.random() * 900000).toString();
    const newDoc: EPIDeclaration = {
      id: `doc-${Date.now()}`,
      numeroUnico: random6DigitNum,
      funcionario: '',
      centroDeCusto: '',
      empresa: 'PNEUBRAS COMERCIO DE PNEUS LTDA',
      matricula: '',
      regTrabalho: 'Normal',
      nascimento: '',
      funcao: '',
      admissao: '',
      setor: '',
      rg: '',
      dataDeclaracao: new Date().toISOString().split('T')[0],
      items: [
        {
          id: `item-init-1`,
          dataEntrega: new Date().toISOString().split('T')[0],
          codigo: '',
          descricao: '',
          un: 'UN',
          qtd: 1,
          codCa: ''
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newDoc, ...declarations];
    setDeclarations(updated);
    setCurrentId(newDoc.id);
    saveToLocalStorage(updated);
    setActiveTab('edit');
    showToast('Nova declaração em branco criada!');
  };

  // Duplicate an existing declaration
  const handleDuplicate = (doc: EPIDeclaration) => {
    const random6DigitNum = Math.floor(100000 + Math.random() * 900000).toString();
    const duplicated: EPIDeclaration = {
      ...JSON.parse(JSON.stringify(doc)),
      id: `doc-${Date.now()}`,
      numeroUnico: random6DigitNum,
      funcionario: `${doc.funcionario} (CÓPIA)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [duplicated, ...declarations];
    setDeclarations(updated);
    setCurrentId(duplicated.id);
    saveToLocalStorage(updated);
    setActiveTab('edit');
    showToast('Declaração duplicada com sucesso!');
  };

  // Delete a declaration
  const handleDelete = (id: string, name: string) => {
    if (declarations.length <= 1) {
      showToast('Não é possível deletar. Você precisa manter pelo menos 1 documento.', 'error');
      return;
    }

    const confirmDelete = window.confirm(`Deseja realmente excluir a declaração de "${name || 'Funcionário sem nome'}"?`);
    if (!confirmDelete) return;

    const filtered = declarations.filter(d => d.id !== id);
    setDeclarations(filtered);
    saveToLocalStorage(filtered);

    if (currentId === id) {
      setCurrentId(filtered[0].id);
    }
    showToast('Documento excluído.');
  };

  // Backup system: export to JSON file
  const exportBackup = () => {
    const dataStr = JSON.stringify({ declarations, catalog }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup-declaracoes-epi-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast('Backup exportado com sucesso!');
  };

  // Backup system: import from JSON file
  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed && Array.isArray(parsed.declarations)) {
          setDeclarations(parsed.declarations);
          saveToLocalStorage(parsed.declarations);
          
          if (parsed.declarations.length > 0) {
            setCurrentId(parsed.declarations[0].id);
          }
          
          if (Array.isArray(parsed.catalog)) {
            setCatalog(parsed.catalog);
            localStorage.setItem('pneubras_epi_catalog', JSON.stringify(parsed.catalog));
          }
          
          showToast('Backup restaurado com sucesso!');
          setActiveTab('list');
        } else {
          showToast('Formato de backup inválido.', 'error');
        }
      } catch (err) {
        showToast('Erro ao ler arquivo de backup.', 'error');
      }
    };
    
    fileReader.readAsText(file);
  };

  // Add item to custom Catalog list
  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatalogItem.codigo || !newCatalogItem.descricao) {
      showToast('Por favor preencha Código e Descrição.', 'error');
      return;
    }

    const updatedCatalog = [...catalog, newCatalogItem];
    setCatalog(updatedCatalog);
    localStorage.setItem('pneubras_epi_catalog', JSON.stringify(updatedCatalog));
    
    setNewCatalogItem({
      codigo: '',
      descricao: '',
      un: 'UN',
      codCa: ''
    });
    setShowCatalogAdd(false);
    showToast(`EPI "${newCatalogItem.descricao}" salvo no catálogo!`);
  };

  const handleRemoveCatalogItem = (codigo: string) => {
    const updated = catalog.filter(it => it.codigo !== codigo);
    setCatalog(updated);
    localStorage.setItem('pneubras_epi_catalog', JSON.stringify(updated));
    showToast('Item removido do catálogo.', 'info');
  };

  // Filtered declarations for list view
  const filteredDeclarations = declarations.filter(d => {
    const query = searchQuery.toLowerCase();
    return (
      d.funcionario.toLowerCase().includes(query) ||
      d.funcao.toLowerCase().includes(query) ||
      d.numeroUnico.toLowerCase().includes(query) ||
      d.setor.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border animate-bounce no-print bg-white"
          style={{
            borderColor: toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#3B82F6'
          }}
        >
          {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
          {toast.type === 'info' && <Sparkles className="h-5 w-5 text-blue-500" />}
          <span className="text-sm font-semibold text-slate-700">{toast.message}</span>
        </div>
      )}

      {/* Main App Navigation (Hidden in Print) */}
      <header className="bg-slate-900 text-white shadow-md px-4 py-2.5 flex items-center justify-between no-print select-none">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-lg shadow-md hover:scale-105 transition-transform flex items-center justify-center max-h-[48px] max-w-[120px] overflow-hidden">
            {customLogo ? (
              <img 
                src={customLogo} 
                alt="Logomarca" 
                style={{ height: '36px', objectFit: 'contain' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <PneuBrasLogo height={36} />
            )}
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight flex items-center gap-1.5">
              <span>Editor de Declaração de EPI</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">PneuBras</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">Gerenciador de Recebimento e Responsabilidade de EPI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download PDF Trigger */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Baixar PDF</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-sm transition-all shadow-md active:scale-95"
            title="Criar nova declaração do zero"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova</span>
          </button>
        </div>
      </header>

      {/* Mobile Toggle Bar (Hidden in Print, visible only on smaller screens) */}
      <div className="bg-slate-800 text-white p-2 flex sm:hidden justify-around border-t border-slate-700 no-print select-none">
        <button
          onClick={() => setMobileView('form')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-colors ${
            mobileView === 'form' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-700'
          }`}
        >
          Preencher Dados
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-md transition-colors ${
            mobileView === 'preview' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-700'
          }`}
        >
          Visualizar Folha ({currentDeclaration?.funcionario ? 'Preenchido' : 'Em Branco'})
        </button>
      </div>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Document Form / Editor & Database Management Panels */}
        <aside 
          className={`w-full md:w-[45%] lg:w-[40%] bg-slate-50 border-r border-slate-200 flex flex-col no-print ${
            mobileView === 'preview' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Sub Navigation Tabs */}
          <nav className="bg-slate-200 p-2 flex gap-1 select-none text-slate-700 border-b border-slate-300">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'edit' ? 'bg-white text-slate-950 shadow-sm' : 'hover:bg-slate-300 text-slate-600'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-amber-500" />
              <span>Formulário</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'list' ? 'bg-white text-slate-950 shadow-sm' : 'hover:bg-slate-300 text-slate-600'
              }`}
            >
              <History className="h-3.5 w-3.5 text-blue-500" />
              <span>Salvos ({declarations.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'catalog' ? 'bg-white text-slate-950 shadow-sm' : 'hover:bg-slate-300 text-slate-600'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-purple-500" />
              <span>EPIs Comuns</span>
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'config' ? 'bg-white text-slate-950 shadow-sm' : 'hover:bg-slate-300 text-slate-600'
              }`}
              title="Configurações e Backup"
            >
              <Download className="h-3.5 w-3.5 text-emerald-500" />
              <span>Backup</span>
            </button>
          </nav>

          {/* Active Tab Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* TAB: EDIT FORM */}
            {activeTab === 'edit' && currentDeclaration && (
              <div className="space-y-6">
                
                {/* Section: Job Quick Load */}
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Preenchimento Rápido por Função</span>
                  </h3>
                  <p className="text-[11px] text-amber-700 mt-1">Carregue dados e EPIs padrão para cargos comuns da PneuBras:</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {FUNCTION_TEMPLATES.map(temp => (
                      <button
                        key={temp.funcao}
                        onClick={() => applyFunctionTemplate(temp.funcao)}
                        className="text-[11px] bg-white border border-amber-300 text-amber-950 hover:bg-amber-100 font-bold py-1 px-2.5 rounded-md transition-colors shadow-sm"
                      >
                        {temp.funcao}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Logomarca Quick Settings */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span>Logomarca do Documento</span>
                      {customLogo && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">Ativa</span>}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {customLogo ? 'Usando logo personalizada carregada.' : 'Usando logo vetorizada padrão da PneuBras.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('config')}
                    className="text-[10px] bg-white border border-slate-300 hover:border-amber-400 font-bold py-1 px-2.5 rounded-md transition-all shadow-sm flex items-center gap-1 shrink-0"
                  >
                    <Upload className="h-3 w-3 text-amber-500" />
                    <span>{customLogo ? 'Alterar Logo' : 'Fazer Upload'}</span>
                  </button>
                </div>

                {/* Section: Employee details fields */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 border-l-2 border-amber-500 pl-2 uppercase tracking-wide">
                      Identificação do Funcionário
                    </h2>
                    <span className="text-xs font-mono text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                      ID: {currentDeclaration.numeroUnico}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={currentDeclaration.funcionario}
                        onChange={(e) => handleFieldChange('funcionario', e.target.value)}
                        placeholder="Ex: Carlos Henrique da Silva"
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Matrícula</label>
                      <input
                        type="text"
                        value={currentDeclaration.matricula}
                        onChange={(e) => handleFieldChange('matricula', e.target.value)}
                        placeholder="Ex: MT-45092"
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Documento RG</label>
                      <input
                        type="text"
                        value={currentDeclaration.rg}
                        onChange={(e) => handleFieldChange('rg', e.target.value)}
                        placeholder="Ex: 42.984.102-X"
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        value={currentDeclaration.nascimento}
                        onChange={(e) => handleFieldChange('nascimento', e.target.value)}
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Data de Admissão</label>
                      <input
                        type="date"
                        value={currentDeclaration.admissao}
                        onChange={(e) => handleFieldChange('admissao', e.target.value)}
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Função</label>
                      <input
                        type="text"
                        value={currentDeclaration.funcao}
                        onChange={(e) => handleFieldChange('funcao', e.target.value)}
                        placeholder="Ex: BORRACHEIRO"
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Setor</label>
                      <input
                        type="text"
                        value={currentDeclaration.setor}
                        onChange={(e) => handleFieldChange('setor', e.target.value)}
                        placeholder="Ex: BORRACHARIA SÊNIOR"
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Centro de Custo</label>
                      <input
                        type="text"
                        value={currentDeclaration.centroDeCusto}
                        onChange={(e) => handleFieldChange('centroDeCusto', e.target.value)}
                        placeholder="Ex: CC-OFICINA-01"
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Reg. de Trabalho</label>
                      <input
                        type="text"
                        value={currentDeclaration.regTrabalho}
                        onChange={(e) => handleFieldChange('regTrabalho', e.target.value)}
                        placeholder="Ex: Normal"
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nº Único Declaração</label>
                      <input
                        type="text"
                        value={currentDeclaration.numeroUnico}
                        onChange={(e) => handleFieldChange('numeroUnico', e.target.value)}
                        placeholder="Ex: 008942"
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-600">Data da Declaração</label>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Sempre Atual
                        </span>
                      </div>
                      <input
                        type="date"
                        value={getLocalDateString()}
                        disabled
                        className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-500 outline-none cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: EPI Items details */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-900 border-l-2 border-amber-500 pl-2 uppercase tracking-wide">
                      Equipamentos Entregues (EPIs)
                    </h2>
                    <button
                      onClick={handleAddItemRow}
                      className="text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1 px-2.5 rounded-md flex items-center gap-1 transition-all"
                    >
                      <Plus className="h-3 w-3 stroke-[3]" />
                      <span>Novo Item</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentDeclaration.items.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-slate-300 transition-all flex flex-col gap-2 relative group"
                      >
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded select-none">
                            Fila #{index + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveItemRow(item.id)}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"
                            title="Remover este EPI"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Item input fields */}
                        <div className="grid grid-cols-12 gap-2 pr-12">
                          <div className="col-span-8">
                            <label className="block text-[10px] font-semibold text-slate-500">Descrição do EPI</label>
                            <input
                              type="text"
                              value={item.descricao}
                              onChange={(e) => handleItemChange(item.id, 'descricao', e.target.value)}
                              placeholder="Ex: ABAFADOR DE RUIDOS"
                              className="w-full text-xs border border-slate-300 rounded p-1 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase font-semibold"
                            />
                          </div>

                          <div className="col-span-4">
                            <label className="block text-[10px] font-semibold text-slate-500">Cód. Interno</label>
                            <input
                              type="text"
                              value={item.codigo}
                              onChange={(e) => handleItemChange(item.id, 'codigo', e.target.value)}
                              placeholder="Ex: 4115"
                              className="w-full text-xs border border-slate-300 rounded p-1 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                            />
                          </div>

                          <div className="col-span-4">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Data Entrega</label>
                            <input
                              type="date"
                              value={item.dataEntrega}
                              onChange={(e) => handleItemChange(item.id, 'dataEntrega', e.target.value)}
                              className="w-full text-[11px] border border-slate-300 rounded p-1 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono text-slate-700"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-[10px] font-semibold text-slate-500">Unidade</label>
                            <input
                              type="text"
                              value={item.un}
                              onChange={(e) => handleItemChange(item.id, 'un', e.target.value)}
                              placeholder="UN"
                              className="w-full text-xs border border-slate-300 rounded p-1 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none uppercase font-mono text-center"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-[10px] font-semibold text-slate-500">Qtd</label>
                            <input
                              type="number"
                              min="1"
                              value={item.qtd}
                              onChange={(e) => handleItemChange(item.id, 'qtd', parseInt(e.target.value) || 1)}
                              className="w-full text-xs border border-slate-300 rounded p-1 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono text-center"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-[10px] font-semibold text-slate-500">C.A.</label>
                            <input
                              type="text"
                              value={item.codCa}
                              onChange={(e) => handleItemChange(item.id, 'codCa', e.target.value)}
                              placeholder="Ex: 15623"
                              className="w-full text-xs border border-slate-300 rounded p-1 bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono text-center"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentDeclaration.items.length === 0 && (
                    <div className="text-center p-6 bg-slate-100 rounded-lg border border-dashed border-slate-300">
                      <p className="text-xs text-slate-400">Nenhum EPI adicionado a esta declaração.</p>
                      <button
                        onClick={handleAddItemRow}
                        className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3 stroke-[2]" /> Adicionar primeira linha
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-[10px] text-slate-400 text-center">
                    As alterações são salvas automaticamente em seu navegador.
                  </p>
                </div>

              </div>
            )}

            {/* TAB: SAVED LIST */}
            {activeTab === 'list' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Declarações Salvas
                  </h2>
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full font-bold">
                    {declarations.length} total
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por funcionário, cargo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="space-y-2">
                  {filteredDeclarations.map(doc => {
                    const isActive = doc.id === currentId;
                    return (
                      <div
                        key={doc.id}
                        className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-amber-50 border-amber-400 shadow-sm ring-1 ring-amber-400' 
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                        onClick={() => {
                          setCurrentId(doc.id);
                          setActiveTab('edit');
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide truncate max-w-[200px]">
                              {doc.funcionario || 'FUNCIONÁRIO SEM NOME'}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5 uppercase font-medium">
                              {doc.funcao || 'Sem Cargo'} • {doc.setor || 'Sem Setor'}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Nº {doc.numeroUnico}
                          </span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <div className="text-slate-400 flex items-center gap-1 text-[10px]">
                            <FileText className="h-3 w-3" />
                            <span>{doc.items.length} {doc.items.length === 1 ? 'EPI' : 'EPIs'} entregues</span>
                          </div>

                          {/* Quick action buttons on list card */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDuplicate(doc)}
                              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Duplicar para outro funcionário"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentId(doc.id);
                                setTimeout(() => {
                                  handleDownloadPDF();
                                }, 150);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Baixar PDF"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id, doc.funcionario)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Deletar declaração"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredDeclarations.length === 0 && (
                    <div className="text-center p-8 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-400">Nenhuma declaração encontrada para a busca.</p>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-bold"
                        >
                          Limpar filtro
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    onClick={handleCreateNew}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Criar Nova Declaração</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: COMMON EPI CATALOG */}
            {activeTab === 'catalog' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Catálogo de EPIs Cadastrados
                  </h2>
                  <button
                    onClick={() => setShowCatalogAdd(!showCatalogAdd)}
                    className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                  >
                    {showCatalogAdd ? 'Cancelar' : '+ Novo EPI'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Clique em um item abaixo para adicioná-lo instantaneamente à declaração de EPI ativa no momento.
                </p>

                {/* Form to add item to catalog */}
                {showCatalogAdd && (
                  <form onSubmit={handleAddCatalogItem} className="bg-white border border-slate-200 p-3 rounded-lg shadow-inner space-y-2">
                    <h3 className="text-xs font-bold text-slate-700">Novo Equipamento no Catálogo</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className="text-[9px] font-semibold text-slate-400 block">Nome do Equipamento (EPI)</label>
                        <input
                          type="text"
                          required
                          placeholder="EX: PROTETOR AURICULAR"
                          value={newCatalogItem.descricao}
                          onChange={e => setNewCatalogItem({...newCatalogItem, descricao: e.target.value})}
                          className="w-full text-xs p-1.5 border rounded uppercase bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-slate-400 block">Cód. Interno</label>
                        <input
                          type="text"
                          required
                          placeholder="EX: 9022"
                          value={newCatalogItem.codigo}
                          onChange={e => setNewCatalogItem({...newCatalogItem, codigo: e.target.value})}
                          className="w-full text-xs p-1.5 border rounded uppercase font-mono bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-slate-400 block">Unidade</label>
                        <input
                          type="text"
                          placeholder="UN, PR, PAR"
                          value={newCatalogItem.un}
                          onChange={e => setNewCatalogItem({...newCatalogItem, un: e.target.value})}
                          className="w-full text-xs p-1.5 border rounded uppercase bg-slate-50"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-semibold text-slate-400 block">Código C.A.</label>
                        <input
                          type="text"
                          placeholder="EX: 12543"
                          value={newCatalogItem.codCa}
                          onChange={e => setNewCatalogItem({...newCatalogItem, codCa: e.target.value})}
                          className="w-full text-xs p-1.5 border rounded uppercase font-mono bg-slate-50"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 rounded"
                    >
                      Salvar Equipamento
                    </button>
                  </form>
                )}

                {/* Catalog list */}
                <div className="space-y-1.5">
                  {catalog.map(epi => (
                    <div
                      key={epi.codigo}
                      onClick={() => addEpiFromCatalog(epi)}
                      className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between hover:bg-amber-50 hover:border-amber-300 cursor-pointer shadow-sm transition-all group"
                    >
                      <div className="text-left flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 font-mono">
                            Cód {epi.codigo}
                          </span>
                          {epi.codCa && (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.1 rounded font-mono">
                              C.A {epi.codCa}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase truncate mt-0.5">
                          {epi.descricao}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                          {epi.un}
                        </span>
                        
                        {/* Remove custom item */}
                        {!COMMON_EPIS.some(c => c.codigo === epi.codigo) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCatalogItem(epi.codigo);
                            }}
                            className="text-slate-300 hover:text-rose-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover do Catálogo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: BACKUP & DATA CONFIGS */}
            {activeTab === 'config' && (
              <div className="space-y-4 text-left">
                <div className="border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Backup e Configurações de Dados
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Administre os registros armazenados no seu navegador.</p>
                </div>

                {/* Upload Custom Logo Card */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-amber-500" />
                    <span>Logomarca da Empresa</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Insira a imagem oficial da sua filial ou marca (PNG, JPG, SVG). Ela substituirá automaticamente a logomarca padrão em todas as fichas impressas.
                  </p>
                  
                  {customLogo ? (
                    <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 flex flex-col items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold self-start">Logomarca Carregada:</span>
                      <img 
                        src={customLogo} 
                        alt="Logo customizada" 
                        className="max-h-16 object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => {
                          if (window.confirm('Deseja remover a logomarca personalizada e restaurar a original?')) {
                            setCustomLogo(null);
                            localStorage.removeItem('pneubras_custom_logo');
                            showToast('Logomarca original restaurada!');
                          }
                        }}
                        className="mt-1 text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-1 px-2.5 rounded-md flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remover e Usar Padrão</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                        isDraggingLogo 
                          ? 'border-amber-400 bg-amber-50/50 animate-pulse' 
                          : 'border-slate-300 hover:border-amber-400 bg-slate-50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        id="custom-logo-file-input"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(file);
                        }}
                        className="hidden"
                      />
                      <label htmlFor="custom-logo-file-input" className="cursor-pointer block">
                        <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-700 block">
                          Clique para selecionar ou Arraste o arquivo
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Formatos recomendados: PNG ou SVG (Máx 2MB)
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Export Card */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileDown className="h-4 w-4 text-emerald-600" />
                    <span>Exportar Backup (JSON)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gere e faça download de um arquivo com todas as declarações e catálogos salvos para segurança ou migração.
                  </p>
                  <button
                    onClick={exportBackup}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Baixar Arquivo .JSON</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span>Importar Backup (JSON)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Restaure registros antigos ou carregue arquivos de declarações compartilhados por outras filiais da PneuBras.
                  </p>
                  
                  <label className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                    <Upload className="h-3.5 w-3.5 text-slate-400" />
                    <span>Selecionar arquivo de backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importBackup}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Restore Defaults */}
                <div className="bg-rose-50 border border-rose-150 p-3.5 rounded-lg space-y-2">
                  <h3 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <RotateCcw className="h-4 w-4 text-rose-600" />
                    <span>Limpar ou Restaurar Sistema</span>
                  </h3>
                  <p className="text-[11px] text-rose-700">
                    Atenção: Restaurar os dados de fábrica excluirá de forma permanente todas as alterações manuais e as declarações atualmente gravadas neste dispositivo!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const confirmReset = window.confirm('Tem certeza absoluta de que quer apagar todas as declarações e redefinir o app? Isso limpará o local storage.');
                        if (confirmReset) {
                          localStorage.clear();
                          setCatalog(COMMON_EPIS);
                          initializeDefault();
                          showToast('Configurações de fábrica restauradas!', 'info');
                          setActiveTab('edit');
                        }
                      }}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-md text-[11px] transition-colors shadow"
                    >
                      Limpar Tudo
                    </button>
                  </div>
                </div>

                <div className="bg-slate-100 p-3 rounded-lg text-[10.5px] text-slate-500 space-y-1">
                  <span className="font-bold block text-slate-700">Sobre o modelo de EPI:</span>
                  <p>Este sistema respeita rigorosamente a NR-6 (Equipamentos de Proteção Individual), NR-1 (Gerenciamento de Riscos Ocupacionais) e o art. 166-167 da CLT brasileira.</p>
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* Right Side: Document Visual Clipboard View */}
        <main 
          className={`flex-1 bg-slate-300 overflow-y-auto p-4 md:p-8 flex items-start justify-center ${
            mobileView === 'form' ? 'hidden sm:flex' : 'flex'
          }`}
          style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        >
          {currentDeclaration ? (
            <div className="w-full flex flex-col items-center gap-4">
              
              {/* Context helper bar (only visible in UI, not in print) */}
              <div className="no-print bg-white/95 backdrop-blur-sm border border-slate-200 py-2 px-4 rounded-xl flex items-center justify-between gap-6 w-full max-w-[210mm] shadow-sm text-xs select-none">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Visualizando Folha A4 Padrão (Modelo Original)</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // Duplicate check
                      handleDuplicate(currentDeclaration);
                    }}
                    className="text-slate-600 hover:text-blue-600 flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Duplicar Ficha</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-bold transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    <span>Baixar PDF</span>
                  </button>
                </div>
              </div>

              {/* High-fidelity PDF layout document container */}
              <div className="shadow-2xl border-4 border-slate-400/20 rounded-sm">
                <EPIDocument declaration={currentDeclaration} customLogo={customLogo} />
              </div>
            </div>
          ) : (
            <div className="no-print text-center p-12 bg-white rounded-xl shadow border border-slate-200 max-w-md my-auto">
              <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Nenhum documento ativo</h3>
              <p className="text-sm text-slate-500 mt-2">
                Crie um novo documento ou restaure o modelo de fábrica para iniciar o preenchimento.
              </p>
              <button
                onClick={handleCreateNew}
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-5 rounded-lg text-sm inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Declaração</span>
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
