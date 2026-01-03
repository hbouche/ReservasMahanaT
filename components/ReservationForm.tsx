import React, { useState, useEffect } from 'react';
import { Category, Reservation, ReservationStatus } from '../types';
import { PlusCircle, Calendar, DollarSign, User, Tag, Clock, UserCheck, Save, X, Pencil, Wallet, Briefcase, Percent, Activity, Keyboard } from 'lucide-react';

interface Props {
  categories: Category[];
  onAddReservation: (res: Omit<Reservation, 'id' | 'createdAt'>) => void;
  onUpdateReservation?: (res: Reservation) => void;
  editingReservation?: Reservation | null;
  onCancelEdit?: () => void;
}

export const ReservationForm: React.FC<Props> = ({ 
  categories, 
  onAddReservation, 
  onUpdateReservation,
  editingReservation,
  onCancelEdit
}) => {
  const initialFormState = {
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    activity: categories.length > 0 ? categories[0].name : '',
    responsible: '',
    seller: 'Mahana Tours',
    price: '',
    cost: '',
    commission: '',
    status: 'Consulta' as ReservationStatus,
    notes: '',
    managedBy: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Effect to populate form when editingReservation changes
  useEffect(() => {
    if (editingReservation) {
      setFormData({
        clientName: editingReservation.clientName,
        date: editingReservation.date,
        time: editingReservation.time,
        activity: editingReservation.activity,
        responsible: editingReservation.responsible,
        seller: editingReservation.seller || 'Mahana Tours',
        price: editingReservation.price.toString(),
        cost: editingReservation.cost ? editingReservation.cost.toString() : '',
        commission: editingReservation.commission ? editingReservation.commission.toString() : '',
        status: editingReservation.status || 'Consulta',
        notes: editingReservation.notes || '',
        managedBy: editingReservation.managedBy || ''
      });
    } else {
      setFormData(prev => ({
          ...initialFormState,
          date: prev.date, // keep current date selected
          time: prev.time,
          managedBy: prev.managedBy // keep manager name if entered previously for convenience
      }));
    }
  }, [editingReservation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.activity) return;

    const commonData = {
      clientName: formData.clientName,
      date: formData.date,
      time: formData.time,
      activity: formData.activity,
      responsible: formData.responsible || 'Por asignar',
      seller: formData.seller,
      price: Number(formData.price) || 0,
      cost: Number(formData.cost) || 0,
      commission: Number(formData.commission) || 0,
      status: formData.status,
      notes: formData.notes,
      managedBy: formData.managedBy
    };

    if (editingReservation && onUpdateReservation) {
      onUpdateReservation({
        ...editingReservation,
        ...commonData
      });
    } else {
      onAddReservation(commonData);
      
      // Reset form mostly, keep date/time/activity/managedBy for faster entry
      setFormData(prev => ({
        ...prev,
        clientName: '',
        price: '',
        cost: '',
        commission: '',
        status: 'Consulta', // Reset status to default
        notes: ''
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 transition-colors ${editingReservation ? 'border-brand-300 ring-4 ring-brand-50' : 'border-gray-100'}`}>
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            {editingReservation ? (
                <>
                    <Pencil className="mr-2 text-brand-600" size={20} />
                    Editar Reserva
                </>
            ) : (
                <>
                    <PlusCircle className="mr-2 text-brand-600" size={20} />
                    Nueva Reserva
                </>
            )}
          </h2>
          {editingReservation && onCancelEdit && (
              <button 
                onClick={onCancelEdit}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full"
                title="Cancelar Edición"
              >
                  <X size={20} />
              </button>
          )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                required
              />
            </div>
          </div>

           {/* Time */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activity Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
                <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                    name="activity"
                    value={formData.activity}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                    required
                >
                    <option value="" disabled>Seleccionar actividad...</option>
                    {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                        {cat.name}
                    </option>
                    ))}
                </select>
                </div>
            </div>

            {/* Responsible */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable / Guía</label>
            <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                type="text"
                name="responsible"
                value={formData.responsible}
                onChange={handleChange}
                className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="Ej. Carlos"
                />
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Seller Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendido por</label>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        name="seller"
                        value={formData.seller}
                        onChange={handleChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                    >
                        <option value="Mahana Tours">Mahana Tours</option>
                        <option value="Playa Caracol">Playa Caracol</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>
            </div>

            {/* Status Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estatus</label>
                <div className="relative">
                    <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white font-medium"
                    >
                        <option value="Consulta">Consulta</option>
                        <option value="Pagado">Pagado</option>
                        <option value="Reservado">Reservado</option>
                        <option value="Cerrado">Cerrado</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Total</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="0.00"
                    required
                    />
                </div>
            </div>

            {/* Cost */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo (Pago)</label>
                <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="0.00"
                    />
                </div>
            </div>

            {/* Commission */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comisión (%)</label>
                <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                    type="number"
                    name="commission"
                    value={formData.commission}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="1"
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="Ej. 10"
                    />
                </div>
            </div>
        </div>
        
        {/* Notes */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
           <textarea
             name="notes"
             value={formData.notes}
             onChange={handleChange}
             rows={2}
             className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
             placeholder="Detalles adicionales..."
           />
        </div>

        {/* Managed By - Last Field */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Gestionado por</label>
           <div className="relative">
                <Keyboard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    name="managedBy"
                    value={formData.managedBy}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-gray-50"
                    placeholder="Nombre de quien ingresa la reserva"
                />
           </div>
           <p className="text-xs text-gray-400 mt-1 ml-1">Persona responsable de ingresar esta información al sistema.</p>
        </div>

        <div className="flex gap-3 pt-2">
            {editingReservation && onCancelEdit && (
                <button
                    type="button"
                    onClick={onCancelEdit}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
            )}
            <button
            type="submit"
            className={`flex-1 font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-white flex justify-center items-center gap-2 ${
                editingReservation ? 'bg-brand-600 hover:bg-brand-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
            >
            {editingReservation ? (
                <>
                    <Save size={20} />
                    Guardar Cambios
                </>
            ) : (
                'Agendar Actividad'
            )}
            </button>
        </div>
      </form>
    </div>
  );
};
