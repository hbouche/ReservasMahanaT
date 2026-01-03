import React, { useMemo, useState } from 'react';
import { Reservation, ReservationStatus } from '../types';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, Pencil, Tag, DollarSign, Wallet, FileText, Briefcase, Activity, Percent } from 'lucide-react';

interface DashboardProps {
  reservations: Reservation[];
  onEdit: (reservation: Reservation) => void;
  onStatusChange: (id: string, status: ReservationStatus) => void;
}

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export const Dashboard: React.FC<DashboardProps> = ({ reservations, onEdit, onStatusChange }) => {
  const [filter, setFilter] = useState<TimeFilter>('week');
  // Removed unused setCurrentDate to prevent build errors
  const currentDate = new Date();

  // Helper to get status styles
  const getStatusStyles = (status: ReservationStatus) => {
    switch (status) {
        case 'Consulta':
            return {
                bg: 'bg-white',
                border: 'border-gray-200',
                header: 'bg-gray-50',
                text: 'text-gray-600',
                badge: 'bg-gray-100 text-gray-600 border-gray-200',
                dot: 'bg-gray-400'
            };
        case 'Pagado':
            return {
                bg: 'bg-green-50',
                border: 'border-green-200',
                header: 'bg-green-100/50',
                text: 'text-green-800',
                badge: 'bg-green-100 text-green-700 border-green-200',
                dot: 'bg-green-500'
            };
        case 'Reservado':
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                header: 'bg-blue-100/50',
                text: 'text-blue-800',
                badge: 'bg-blue-100 text-blue-700 border-blue-200',
                dot: 'bg-blue-500'
            };
        case 'Cerrado':
            return {
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                header: 'bg-purple-100/50',
                text: 'text-purple-800',
                badge: 'bg-purple-100 text-purple-700 border-purple-200',
                dot: 'bg-purple-500'
            };
        default:
             return {
                bg: 'bg-white',
                border: 'border-gray-200',
                header: 'bg-gray-50',
                text: 'text-gray-600',
                badge: 'bg-gray-100 text-gray-600 border-gray-200',
                dot: 'bg-gray-400'
            };
    }
  };

  // Logic to filter data based on selected range (For Stats and Timeline views)
  const { filteredReservations, dateLabel } = useMemo(() => {
      const now = new Date();
      // Reset time to start of day for comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let filtered = reservations;
      let label = "Todas las Actividades";

      if (filter === 'today') {
          const todayStr = now.toISOString().split('T')[0];
          filtered = reservations.filter(r => r.date === todayStr);
          label = "Agenda de Hoy";
      } else if (filter === 'week') {
          // Start of week (Monday)
          const day = today.getDay() || 7; 
          if( day !== 1 ) today.setHours(-24 * (day - 1));
          const startOfWeek = today;
          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          filtered = reservations.filter(r => {
              const rDate = new Date(r.date + 'T00:00:00'); 
              return rDate >= startOfWeek && rDate <= endOfWeek;
          });
          label = "Agenda Semanal";
      } else if (filter === 'month') {
          // Note: The visual calendar handles its own data slicing, 
          // but we filter here for the stats cards.
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          filtered = reservations.filter(r => {
              const rDate = new Date(r.date + 'T00:00:00');
              return rDate >= startOfMonth && rDate <= endOfMonth;
          });
          label = "Calendario Mensual";
      } else if (filter === 'year') {
           const startOfYear = new Date(now.getFullYear(), 0, 1);
           const endOfYear = new Date(now.getFullYear(), 11, 31);
           filtered = reservations.filter(r => {
              const rDate = new Date(r.date + 'T00:00:00');
              return rDate >= startOfYear && rDate <= endOfYear;
           });
           label = "Calendario Anual";
      }

      return { filteredReservations: filtered, dateLabel: label };
  }, [reservations, filter]);

  // Operational Stats
  const stats = useMemo(() => {
      const totalPax = filteredReservations.length;
      const uniqueActivities = new Set(filteredReservations.map(r => r.activity)).size;
      const guides = new Set(filteredReservations.map(r => r.responsible).filter(r => r && r !== 'Por asignar')).size;
      return { totalPax, uniqueActivities, guides };
  }, [filteredReservations]);


  // --- CALENDAR VIEW HELPERS ---

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    // We want Monday to be index 0
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // --- RENDERERS ---

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptySlots = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             {/* Calendar Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-gray-800 capitalize">
                    {MONTH_NAMES[month]} {year}
                 </h3>
                 {/* Navigation could go here, for now it's static current month based on filter logic request */}
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {WEEK_DAYS.map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide border-r last:border-r-0 border-gray-100">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid Body */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px border-b border-gray-200">
                {emptySlots.map(slot => (
                    <div key={`empty-${slot}`} className="bg-gray-50 min-h-[120px]" />
                ))}
                
                {daysArray.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayReservations = reservations.filter(r => r.date === dateStr)
                        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    return (
                        <div key={day} className={`bg-white min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-gray-50 ${isToday ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-600 text-white' : 'text-gray-700'}`}>
                                    {day}
                                </span>
                                {dayReservations.length > 0 && (
                                    <span className="text-xs text-gray-400 font-medium">{dayReservations.length} res.</span>
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                                {dayReservations.map(r => {
                                    const styles = getStatusStyles(r.status);
                                    return (
                                        <button 
                                            key={r.id} 
                                            onClick={() => onEdit(r)}
                                            className={`text-left text-xs p-1.5 rounded border border-l-4 shadow-sm hover:opacity-80 transition-all ${styles.bg} ${styles.border} border-l-${styles.dot.replace('bg-', '')}`}
                                            style={{ borderLeftColor: r.status === 'Pagado' ? '#22c55e' : r.status === 'Reservado' ? '#3b82f6' : r.status === 'Cerrado' ? '#a855f7' : '#9ca3af' }}
                                        >
                                            <div className="font-bold text-gray-800 leading-tight truncate">{r.time} {r.clientName}</div>
                                            <div className="text-[10px] text-gray-500 truncate">{r.activity}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Fill remaining cells to make grid nice if needed, or just let CSS grid handle it. CSS Grid auto-rows-fr handles it well. */}
            </div>
        </div>
    );
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Panorama Anual {year}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {months.map(month => {
                    const daysInMonth = getDaysInMonth(year, month);
                    const firstDay = getFirstDayOfMonth(year, month);
                    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                    const emptySlots = Array.from({ length: firstDay }, (_, i) => i);

                    return (
                        <div key={month} className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-gray-800 mb-2 capitalize text-center">{MONTH_NAMES[month]}</h4>
                            
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {/* Weekday headers tiny */}
                                {WEEK_DAYS.map(d => <span key={d} className="text-[10px] text-gray-400 font-medium">{d.charAt(0)}</span>)}
                                
                                {emptySlots.map(s => <div key={`e-${s}`} />)}

                                {daysArray.map(day => {
                                     const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                     const dayReservations = reservations.filter(r => r.date === dateStr);
                                     const hasActivity = dayReservations.length > 0;
                                     
                                     // Determine color based on dominant status or just activity
                                     let dotClass = 'bg-gray-100 text-gray-400';
                                     if (hasActivity) {
                                         // Check if any is confirmed/paid
                                         const hasPaid = dayReservations.some(r => r.status === 'Pagado' || r.status === 'Cerrado');
                                         const hasReserved = dayReservations.some(r => r.status === 'Reservado');
                                         
                                         if (hasPaid) dotClass = 'bg-green-100 text-green-700 font-bold';
                                         else if (hasReserved) dotClass = 'bg-blue-100 text-blue-700 font-bold';
                                         else dotClass = 'bg-gray-200 text-gray-700 font-bold';
                                     }

                                     return (
                                         <div 
                                            key={day} 
                                            className={`text-[10px] h-6 flex items-center justify-center rounded-full ${dotClass}`}
                                            title={`${dayReservations.length} reservas`}
                                         >
                                             {day}
                                         </div>
                                     );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  // Timeline View Logic (Reusing existing logic for Today, Week, All)
  // Group by Date and Sort by Time
  const timeline = useMemo(() => {
      const grouped: Record<string, Reservation[]> = {};
      filteredReservations.forEach(r => {
          if (!grouped[r.date]) grouped[r.date] = [];
          grouped[r.date].push(r);
      });
      
      const sortedDates = Object.keys(grouped).sort();
      
      return sortedDates.map(date => ({
          date,
          items: grouped[date].sort((a, b) => {
              // Sort by time
              return (a.time || '00:00').localeCompare(b.time || '00:00');
          })
      }));
  }, [filteredReservations]);

  // Helper for nice date formatting in Timeline
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return {
        dayName: date.toLocaleDateString('es-ES', { weekday: 'long' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('es-ES', { month: 'short' })
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{dateLabel}</h2>
            <p className="text-gray-500 text-sm">Vista operativa y logística</p>
          </div>

          <div className="flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm overflow-x-auto">
            {(['today', 'week', 'month', 'year', 'all'] as TimeFilter[]).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                        filter === f
                        ? 'bg-brand-100 text-brand-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {f === 'today' ? 'Hoy' 
                    : f === 'week' ? 'Semana' 
                    : f === 'month' ? 'Mes'
                    : f === 'year' ? 'Año'
                    : 'Todo'}
                </button>
            ))}
        </div>
      </div>

      {/* Operational Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
             <span className="text-2xl font-bold text-brand-600">{stats.totalPax}</span>
             <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Reservas</span>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
             <span className="text-2xl font-bold text-purple-600">{stats.uniqueActivities}</span>
             <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Tipos de Actividad</span>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
             <span className="text-2xl font-bold text-orange-600">{stats.guides}</span>
             <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Guías Activos</span>
         </div>
      </div>

      {/* CONDITIONAL RENDERING BASED ON VIEW */}
      
      {filter === 'month' ? (
          renderMonthView()
      ) : filter === 'year' ? (
          renderYearView()
      ) : (
          /* Main Timeline View (Today, Week, All) */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] p-6">
            {timeline.length > 0 ? (
                <div className="space-y-8">
                    {timeline.map((dayGroup) => {
                        const { dayName, dayNum, month } = formatDateHeader(dayGroup.date);
                        return (
                            <div key={dayGroup.date} className="flex flex-col md:flex-row gap-6">
                                {/* Date Column */}
                                <div className="md:w-32 flex-shrink-0">
                                    <div className="sticky top-20 flex md:flex-col items-center md:items-start gap-2 md:gap-0">
                                        <span className="text-3xl font-bold text-gray-800">{dayNum}</span>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-sm font-bold text-brand-600 uppercase">{month}</span>
                                            <span className="text-sm text-gray-400 capitalize">{dayName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Activities Grid for the Day */}
                                <div className="flex-1 space-y-3 relative border-l-2 border-gray-100 pl-6 md:pl-8 pb-4">
                                    {dayGroup.items.map((r, idx) => {
                                        const styles = getStatusStyles(r.status || 'Consulta');
                                        
                                        return (
                                        <div key={r.id} className="relative group">
                                            {/* Timeline Dot */}
                                            <div className="absolute -left-[39px] md:-left-[47px] top-6 w-5 h-5 rounded-full border-4 border-white bg-brand-400 shadow-sm z-10"></div>
                                            
                                            {/* Card Container */}
                                            <div className={`${styles.bg} border ${styles.border} rounded-lg overflow-hidden hover:shadow-md transition-all`}>
                                                
                                                {/* Card Header: Time & Activity */}
                                                <div className={`${styles.header} px-4 py-2 border-b ${styles.border} flex justify-between items-center`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center text-brand-700 font-bold bg-white px-2 py-0.5 rounded text-sm border border-gray-200 shadow-sm">
                                                            <Clock size={14} className="mr-1.5" />
                                                            {r.time || '00:00'}
                                                        </div>
                                                        <div className={`flex items-center gap-2 font-bold ${styles.text}`}>
                                                            <Tag size={16} />
                                                            {r.activity}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <select
                                                                value={r.status || 'Consulta'}
                                                                onChange={(e) => onStatusChange(r.id, e.target.value as ReservationStatus)}
                                                                className={`text-xs font-semibold px-2 py-1 pr-6 rounded-full border ${styles.badge} appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <option value="Consulta">Consulta</option>
                                                                <option value="Pagado">Pagado</option>
                                                                <option value="Reservado">Reservado</option>
                                                                <option value="Cerrado">Cerrado</option>
                                                            </select>
                                                            <div className="absolute inset-y-0 right-0 flex items-center px-1.5 pointer-events-none">
                                                                <Activity size={10} className="text-current opacity-70" />
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => onEdit(r)}
                                                            className="text-gray-400 hover:text-brand-600 transition-colors p-1"
                                                            title="Editar"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Card Body: Info Grid */}
                                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Left: People */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <User size={16} className="text-gray-400" />
                                                            <span className="font-semibold">Cliente:</span>
                                                            <span>{r.clientName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <CheckCircle size={16} className="text-gray-400" />
                                                            <span className="font-semibold">Responsable:</span>
                                                            <span className={r.responsible && r.responsible !== 'Por asignar' ? 'text-gray-800' : 'text-gray-400 italic'}>
                                                                {r.responsible}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Briefcase size={16} className="text-indigo-400" />
                                                            <span className="font-semibold">Vendedor:</span>
                                                            <span className="text-gray-600">{r.seller || 'N/A'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Right: Finances */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <DollarSign size={16} className="text-green-500" />
                                                            <span className="font-semibold">Precio:</span>
                                                            <span className="text-green-700 font-medium">${r.price.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Wallet size={16} className="text-orange-400" />
                                                            <span className="font-semibold">Costo:</span>
                                                            <span className="text-gray-600">${r.cost ? r.cost.toLocaleString() : '0'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Percent size={16} className="text-blue-400" />
                                                            <span className="font-semibold">Comisión:</span>
                                                            <span className="text-gray-600">{r.commission ? `${r.commission}%` : '0%'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Footer: Notes (if any) */}
                                                {r.notes && (
                                                    <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100 flex items-start gap-2 text-xs text-gray-600">
                                                        <FileText size={14} className="mt-0.5 text-yellow-500 shrink-0" />
                                                        <span className="italic">{r.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                    <CalendarIcon size={64} className="mb-4 opacity-20" />
                    <p className="text-lg">No hay actividades programadas para este periodo.</p>
                    <button onClick={() => setFilter('all')} className="text-brand-600 text-sm mt-2 hover:underline">Ver todo el historial</button>
                </div>
            )}
          </div>
      )}
    </div>
  );
};
