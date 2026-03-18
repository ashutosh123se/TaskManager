'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight, X, Cpu, AlignLeft } from 'lucide-react';
import api from '@/lib/axios';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<TaskStatus>('PENDING');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data.data);
      setTotalPages(res.data.pagination.pages || 1);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const delayDebounceTask = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(delayDebounceTask);
  }, [fetchTasks]);

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormTitle(task.title);
      setFormDescription(task.description || '');
      setFormStatus(task.status);
    } else {
      setEditingTask(null);
      setFormTitle('');
      setFormDescription('');
      setFormStatus('PENDING');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, {
          title: formTitle,
          description: formDescription,
          status: formStatus,
        });
      } else {
        await api.post('/tasks', {
          title: formTitle,
          description: formDescription,
          status: formStatus,
        });
      }
      closeModal();
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Initiate destructive sequence for this entity?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-blue-400" />
            Control Center
          </h1>
          <p className="mt-2 text-sm font-mono text-gray-400">Monitor and manipulate your data streams.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => openModal()}
            className="glass-button flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            <Plus className="h-5 w-5" />
            Spawn Entity
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col sm:flex-row gap-4 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="relative flex-1 z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="glass-input block w-full rounded-xl border-white/10 py-3 pl-12 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
            placeholder="Query telemetry..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="sm:w-56 z-10">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="glass-input block w-full rounded-xl border-white/10 py-3 pl-4 pr-10 text-white focus:ring-2 focus:ring-blue-500 sm:text-sm appearance-none bg-slate-900"
          >
            <option value="">All States</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <ul role="list" className="divide-y divide-white/5">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-blue-400 space-y-4">
              <div className="w-10 h-10 border-2 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="font-mono text-sm tracking-widest animate-pulse">FETCHING BLOCKS...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-gray-500 space-y-4">
              <AlignLeft className="w-12 h-12 text-gray-700" />
              <p className="font-mono text-sm">NO DATA FOUND IN CURRENT METRIC</p>
            </div>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="relative flex items-center justify-between gap-x-6 p-6 hover:bg-white/[0.02] transition group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-x-4">
                    <p className="text-lg font-semibold text-white truncate">{task.title}</p>
                    <span className={`block rounded-lg px-2.5 py-1 text-xs font-mono font-medium border ${getStatusColor(task.status)} tracking-wider`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  {task.description && (
                    <div className="mt-2 flex items-center gap-x-2 text-sm text-gray-400 font-light">
                      <p className="truncate max-w-2xl">{task.description}</p>
                    </div>
                  )}
                  <p className="mt-3 text-xs font-mono text-gray-600 uppercase tracking-widest">
                    Log {new Date(task.createdAt).getTime().toString().slice(-6)} • {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-none items-center gap-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(task)} className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition border border-blue-500/20">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteTask(task.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition border border-red-500/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/5 bg-white/5 px-6 py-4">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-mono text-gray-400">
                PAGE <span className="font-bold text-white">{page}</span> OF <span className="font-bold text-white">{Math.max(1, totalPages)}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm overflow-hidden" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 transition focus:z-20 border border-white/10"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-4 py-2 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 transition focus:z-20 border border-white/10 border-l-0"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Modal Overlay */}
      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-2xl glass-panel px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8 border border-white/10">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button onClick={closeModal} className="rounded-full p-1 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition outline-none">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-400" />
                      {editingTask ? 'Modify Entity' : 'Initialize New Entity'}
                    </h3>
                    <div className="mt-8">
                      <form id="task-form" onSubmit={handleSaveTask} className="space-y-6">
                        <div>
                          <label className="block text-xs font-mono font-medium text-blue-300 mb-2 tracking-widest">IDENTIFIER <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            required
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            className="glass-input block w-full rounded-xl py-3 px-4 text-white placeholder:text-gray-600 sm:text-sm"
                            placeholder="Enter core objective"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-medium text-blue-300 mb-2 tracking-widest">PAYLOAD (ENCRYPTED)</label>
                          <textarea
                            rows={3}
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="glass-input block w-full rounded-xl py-3 px-4 text-white placeholder:text-gray-600 sm:text-sm"
                            placeholder="Secure telemetry data..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-medium text-blue-300 mb-2 tracking-widest">STATE</label>
                          <select
                            value={formStatus}
                            onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                            className="glass-input block w-full rounded-xl py-3 px-4 text-white sm:text-sm appearance-none bg-slate-800"
                          >
                            <option value="PENDING">Pending Execution</option>
                            <option value="IN_PROGRESS">Compiling</option>
                            <option value="COMPLETED">Resolved</option>
                          </select>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="mt-8 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    form="task-form"
                    className="glass-button w-full inline-flex justify-center rounded-xl px-5 py-3 text-sm font-semibold sm:w-auto"
                  >
                    {editingTask ? 'Commit Changes' : 'Broadcast'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 inline-flex w-full justify-center rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition sm:mt-0 sm:w-auto"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
