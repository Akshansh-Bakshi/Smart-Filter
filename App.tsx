
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileUp, 
  Filter, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Table as TableIcon, 
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  History,
  LayoutDashboard,
  Trash2
} from 'lucide-react';
import { AppStatus, SheetData, SheetRow } from './types';
import { parseExcelFile, exportToExcel } from './services/excelService';
import { processRequirements } from './services/geminiService';
import DataTable from './components/DataTable';
import Visualization from './components/Visualization';
import SmartFilterLogo from './components/SmartFilterLogo';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.SPLASH);
  const [data, setData] = useState<SheetData | null>(null);
  const [history, setHistory] = useState<SheetData[]>([]);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'viz' | 'history'>('table');

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus(AppStatus.IDLE);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(AppStatus.LOADING_FILE);
    setError(null);
    try {
      const { headers, rows } = await parseExcelFile(file);
      const newData: SheetData = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        fileName: file.name,
        headers,
        rows,
        originalRows: [...rows]
      };
      setData(newData);
      setStatus(AppStatus.READY);
    } catch (err) {
      console.error(err);
      setError("Failed to parse the Excel file. Please ensure it's a valid .xlsx or .xls file.");
      setStatus(AppStatus.ERROR);
    }
  };

  const resetData = () => {
    if (!data) return;
    setData({
      ...data,
      headers: [...(data.originalRows[0] ? Object.keys(data.originalRows[0]) : [])],
      rows: [...data.originalRows]
    });
    setAiExplanation(null);
    setPrompt('');
    setError(null);
  };

  const handleApplyAI = async () => {
    if (!data || !prompt.trim()) return;

    setStatus(AppStatus.PROCESSING_AI);
    setError(null);
    setAiExplanation(null);

    try {
      const sample = data.originalRows.slice(0, 10);
      const result = await processRequirements(prompt, data.headers, sample);

      if (result.error) {
        setError(result.error);
        setStatus(AppStatus.READY);
        return;
      }

      let filtered = [...data.originalRows];

      if (result.code) {
        try {
          const filterFn = new Function('row', `try { ${result.code} } catch(e) { return true; }`);
          filtered = filtered.filter(row => {
            const fnResult = filterFn(row);
            return typeof fnResult === 'boolean' ? fnResult : true;
          });
        } catch (evalErr) {
          throw new Error("The generated filter logic could not be executed.");
        }
      }

      let finalHeaders = data.headers;
      if (result.columns && result.columns.length > 0) {
        const selectedCols = result.columns.filter((c: string) => data.headers.includes(c));
        if (selectedCols.length > 0) finalHeaders = selectedCols;
      }

      const updatedData: SheetData = {
        ...data,
        headers: finalHeaders,
        rows: filtered,
        query: prompt
      };

      setData(updatedData);
      setHistory(prev => [updatedData, ...prev.slice(0, 9)]); // Keep last 10
      setAiExplanation(result.explanation);
      setStatus(AppStatus.READY);
      setActiveTab('table');

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during processing.");
      setStatus(AppStatus.READY);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  if (status === AppStatus.SPLASH) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center overflow-hidden z-[100]">
        <div className="animate-slide-up flex flex-col items-center">
          <SmartFilterLogo size={100} className="text-indigo-400 mb-8" />
          <h1 className="text-4xl sm:text-6xl font-black text-white text-center mb-6 tracking-tight">
            Welcome to the <br/>
            <span className="text-indigo-500 italic">future</span> of filtering
          </h1>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">
              Initializing Statistical Models...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-indigo-400">
              <SmartFilterLogo size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
              SMART<span className="text-indigo-600">FILTER</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {data && (
              <button
                onClick={() => exportToExcel(data.rows, data.fileName)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-bold text-sm shadow-lg shadow-slate-200"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!data ? (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-white rounded-3xl p-16 border-4 border-dashed border-slate-100 hover:border-indigo-200 transition-all group relative overflow-hidden text-center">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0">
                {status === AppStatus.LOADING_FILE ? <Loader2 className="animate-spin" size={40} /> : <FileUp size={40} />}
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Start with your data</h2>
              <p className="text-slate-500 mb-8 text-lg">Upload an Excel or CSV file to unlock AI-powered insights.</p>
              <div className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Select Spreadsheet
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-sm text-slate-600 font-medium">Rows</span>
                    <span className="text-lg font-bold text-slate-900">{data.rows.length}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-50 pb-2">
                    <span className="text-sm text-slate-600 font-medium">Cols</span>
                    <span className="text-lg font-bold text-slate-900">{data.headers.length}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setData(null)}
                  className="w-full mt-6 py-3 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} /> New Project
                </button>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white">
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <History size={14} /> History
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No previous filters yet.</p>
                  ) : (
                    history.map((item) => (
                      <div 
                        key={item.id} 
                        className="group bg-slate-800 p-3 rounded-xl border border-slate-700/50 cursor-pointer hover:border-indigo-500/50 transition-all relative"
                        onClick={() => {
                          setData(item);
                          setPrompt(item.query || '');
                        }}
                      >
                        <p className="text-[10px] text-slate-500 mb-1">{new Date(item.timestamp).toLocaleTimeString()}</p>
                        <p className="text-xs font-bold truncate pr-4">{item.query || 'Reset'}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                          className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Main Workspace */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* AI Prompt Area */}
              <div className="bg-white rounded-3xl border-2 border-slate-50 p-1 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Tell Smart Filter what to do... (e.g., 'Only show items with high margins')"
                      className="w-full h-full min-h-[100px] bg-transparent p-6 text-lg font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none resize-none"
                    />
                    {status === AppStatus.PROCESSING_AI && (
                       <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl z-20">
                         <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-full text-white shadow-xl">
                           <Loader2 className="animate-spin" size={20} />
                           <span className="font-bold text-sm">Gemini is Thinking...</span>
                         </div>
                       </div>
                    )}
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleApplyAI}
                      disabled={status === AppStatus.PROCESSING_AI || !prompt.trim()}
                      className="h-full w-full sm:w-32 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-2xl flex flex-col items-center justify-center gap-2 p-4 transition-all shadow-lg shadow-indigo-100"
                    >
                      <Sparkles size={24} className={status === AppStatus.PROCESSING_AI ? 'animate-pulse' : ''} />
                      <span className="text-xs font-black uppercase">Run</span>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-700 animate-in zoom-in duration-200">
                  <XCircle className="shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-black text-sm uppercase">Processing Error</h4>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {aiExplanation && !error && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4 text-emerald-800 animate-in slide-in-from-left duration-300">
                  <CheckCircle2 className="shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-black text-sm uppercase">Insight Generated</h4>
                    <p className="text-sm font-medium">{aiExplanation}</p>
                  </div>
                </div>
              )}

              {/* Result Area Tabs */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
                  {[
                    { id: 'table', icon: <TableIcon size={16} />, label: 'Data Table' },
                    { id: 'viz', icon: <BarChart3 size={16} />, label: 'Visual Statistics' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center px-4">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Preview Mode</span>
                  </div>
                </div>

                <div className="p-4 flex-1">
                  {activeTab === 'table' ? (
                    <DataTable headers={data.headers} rows={data.rows} />
                  ) : (
                    <Visualization data={data.rows} headers={data.headers} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
