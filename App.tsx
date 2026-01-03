import React, { useEffect, useState } from 'react';
import { Category, Reservation, ReservationStatus } from './types';
import { ReservationForm } from './components/ReservationForm';
import { ReservationList } from './components/ReservationList';
import { Dashboard } from './components/Dashboard';
import { LayoutDashboard, Settings } from 'lucide-react';
import { INITIAL_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('categories');
    const savedReservations = localStorage.getItem('reservations');

    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
        } else {
            setCategories(INITIAL_CATEGORIES);
        }
      } catch (e) { 
          console.error("Error parsing categories", e);
          setCategories(INITIAL_CATEGORIES);
      }
    } else {
        setCategories(INITIAL_CATEGORIES);
    }

    if (savedReservations) {
      try {
        setReservations(JSON.parse(savedReservations));
      } catch (e) { console.error("Error parsing reservations", e); }
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('reservations', JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (data: Omit<Reservation, 'id' | 'createdAt'>) => {
    const newReservation: Reservation = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setReservations(prev => [...prev, newReservation]);
  };

  const updateReservation = (updatedData: Reservation) => {
    setReservations(prev => prev.map(r => r.id === updatedData.id ? updatedData : r));
    setEditingReservation(null);
    // Optional: Switch back to dashboard after save, or stay in form. 
    // Let's stay in form to show empty state or switch to list? Let's switch to Dashboard to see the change.
    setView('dashboard'); 
  };

  const deleteReservation = (id: string) => {
      if (window.confirm("¿Estás seguro de que deseas eliminar esta reserva?")) {
          setReservations(prev => prev.filter(r => r.id !== id));
          if (editingReservation?.id === id) {
            setEditingReservation(null);
          }
      }
  };

  const handleEditClick = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setView('form');
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleCancelEdit = () => {
    setEditingReservation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                    <LayoutDashboard size={24} />
                </div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Portal de Reservas</h1>
            </div>
            
            <nav className="flex space-x-2">
                <button
                    onClick={() => { setView('dashboard'); setEditingReservation(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        view === 'dashboard' 
                        ? 'bg-brand-50 text-brand-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    Tablero
                </button>
                <button
                    onClick={() => setView('form')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        view === 'form' 
                        ? 'bg-brand-50 text-brand-700' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    Gestión
                </button>
            </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'dashboard' && (
             <div className="space-y-8">
                 <Dashboard 
                    reservations={reservations} 
                    onEdit={handleEditClick}
                    onStatusChange={handleStatusChange}
                 />
                 
                 <div className="mt-8">
                    <ReservationList 
                        reservations={reservations} 
                        categories={categories}
                        onDelete={deleteReservation}
                        onEdit={handleEditClick}
                    />
                 </div>
             </div>
        )}

        {view === 'form' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input (Now takes more space since uploader is gone) */}
                <div className="lg:col-span-2 space-y-8">
                    <ReservationForm 
                        categories={categories} 
                        onAddReservation={addReservation}
                        onUpdateReservation={updateReservation}
                        editingReservation={editingReservation}
                        onCancelEdit={handleCancelEdit}
                    />
                </div>

                {/* Right Column: Info & Categories List (Removed Uploader) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Small list preview */}
                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Últimas Agregadas</h3>
                        <ul className="space-y-3">
                            {reservations.slice(-5).reverse().map(r => (
                                <li key={r.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <div className="font-semibold text-gray-900">{r.clientName}</div>
                                        <div className="text-xs text-brand-600">{r.activity}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">{r.date}</div>
                                        <div className="text-xs font-mono text-gray-400">{r.time}</div>
                                    </div>
                                </li>
                            ))}
                            {reservations.length === 0 && <p className="text-gray-400 text-sm">Sin datos recientes.</p>}
                        </ul>
                     </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                            <Settings size={18} className="mr-2 text-gray-400"/>
                            Categorías Disponibles
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-3 max-h-96 overflow-y-auto custom-scrollbar">
                            {categories.map(c => (
                                <span key={c.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                                    {c.name}
                                </span>
                            ))}
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
