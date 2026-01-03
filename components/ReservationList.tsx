import React, { useState } from 'react';
import { Category, Reservation, ReservationStatus } from '../types';
import { Download, Trash2, Calendar, FileText, Clock, UserCheck, Pencil, DollarSign, Wallet, Briefcase, Activity } from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface Props {
  reservations: Reservation[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (reservation: Reservation) => void;
}

export const ReservationList: React.FC<Props> = ({ reservations, categories, onDelete, onEdit }) => {
  const [activeTab, setActiveTab] = useState('all');

  const activeTabs = new Set([
      'all', 
      ...categories.map(c => c.name), 
      ...reservations.map(r => r.activity)
  ]);
  const tabs = Array.from(activeTabs).sort();

  const filteredReservations = reservations
    .filter(r => activeTab === 'all' || r.activity === activeTab)
    .sort((a, b) => {
         const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
         const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
         return dateA.getTime() - dateB.getTime();
    });

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
        case 'Pagado': return 'bg-green-100 text-green-700 border-green-200';
        case 'Reservado': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Cerrado': return 'bg-purple-100 text-purple-700 border-purple-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FileText className="mr-2 text-brand-600" />
            Hoja de Reservas
        </h2>
        <button
          onClick={() => exportToExcel(reservations)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Download size={16} />
          Exportar a Excel (Pestañas)
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200 px-2 py-1 scrollbar-hide">
        <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                activeTab === 'all'
                ? 'bg-white text-brand-600 border-brand-600'
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-100'
            }`}
        >
            Todas
        </button>
        {tabs.filter(t => t !== 'all').map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
               activeTab === tab
                 ? 'bg-white text-brand-600 border-brand-600'
                 : 'text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-100'
             }`}
           >
             {tab}
           </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-semibold border-b">Fecha/Hora</th>
              <th className="px-6 py-3 font-semibold border-b">Cliente</th>
              <th className="px-6 py-3 font-semibold border-b">Estatus</th>
              <th className="px-6 py-3 font-semibold border-b">Actividad</th>
              <th className="px-6 py-3 font-semibold border-b">Vendedor</th>
              <th className="px-6 py-3 font-semibold border-b">Responsable</th>
              <th className="px-6 py-3 font-semibold border-b">Finanzas</th>
              <th className="px-6 py-3 font-semibold border-b text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredReservations.length > 0 ? (
              filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                             <Calendar size={14} className="text-gray-400" />
                             {res.date}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 pl-6">
                            <Clock size={12} />
                            {res.time || '--:--'}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{res.clientName}</td>
                   <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(res.status || 'Consulta')}`}>
                            {res.status || 'Consulta'}
                        </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100">
                        {res.activity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                     <div className="flex items-center gap-1">
                         <Briefcase size={14} className="text-indigo-400" />
                         {res.seller || 'N/A'}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                     <div className="flex items-center gap-1">
                         <UserCheck size={14} className="text-gray-400" />
                         {res.responsible || <span className="text-gray-400 italic">Sin asignar</span>}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-green-700 text-xs font-medium" title="Precio Cliente">
                              <DollarSign size={12} />
                              {res.price}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                             {res.cost > 0 && (
                                <div className="flex items-center gap-1 text-gray-500 text-xs" title="Costo Operativo">
                                    <Wallet size={12} />
                                    {res.cost}
                                </div>
                              )}
                              {res.commission > 0 && (
                                <div className="flex items-center gap-1 text-blue-500 text-xs" title="Comisión %">
                                    % {res.commission}
                                </div>
                              )}
                          </div>
                      </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button
                        onClick={() => onEdit(res)}
                        className="text-blue-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Editar"
                        >
                        <Pencil size={16} />
                        </button>
                        <button
                        onClick={() => onDelete(res.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar"
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  No hay reservas en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
