import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { parseCategoriesFromExcel } from '../services/excelService';
import { Category } from '../types';

interface Props {
  onCategoriesLoaded: (categories: Category[]) => void;
}

export const CategoryUploader: React.FC<Props> = ({ onCategoriesLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFile = async (file: File) => {
    setStatus('loading');
    try {
      const categories = await parseCategoriesFromExcel(file);
      onCategoriesLoaded(categories);
      setStatus('success');
      setMessage(`${categories.length} categorías cargadas.`);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Error al leer el archivo. Asegúrate que sea un Excel válido.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
        <FileSpreadsheet className="mr-2 text-green-600" size={20} />
        Configuración
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Carga tu archivo Excel de tours para poblar automáticamente los menús desplegables.
      </p>

      <div
        className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
          isDragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
        
        {status === 'idle' && (
          <>
            <Upload className="text-gray-400 mb-3" size={32} />
            <p className="text-sm text-gray-600 text-center font-medium">
              Arrastra tu Excel aquí o haz clic
            </p>
            <p className="text-xs text-gray-400 mt-1">.xlsx o .xls</p>
          </>
        )}

        {status === 'loading' && (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-600">Procesando...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center text-green-600">
            <CheckCircle size={32} className="mb-2" />
            <p className="text-sm font-bold text-center">{message}</p>
          </div>
        )}

        {status === 'error' && (
            <div className="flex flex-col items-center text-red-500">
              <AlertCircle size={32} className="mb-2" />
              <p className="text-sm text-center">{message}</p>
            </div>
        )}
      </div>
    </div>
  );
};
