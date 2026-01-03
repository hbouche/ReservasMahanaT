import * as XLSX from 'xlsx';
import { Reservation, Category } from '../types';

// Helper to read categories from an uploaded Excel file
export const parseCategoriesFromExcel = async (file: File): Promise<Category[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Assume the first sheet contains the data
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        // Flatten the array and extract strings. 
        // We assume column A contains the activity names if there's no header, 
        // or we look for a header named "Actividad", "Activity", "Tour", "Categoria".
        
        let categories: string[] = [];

        if (jsonData.length > 0) {
            // Check headers in first row
            const headerRow = jsonData[0].map(h => String(h).toLowerCase());
            let colIndex = headerRow.findIndex(h => h.includes('activ') || h.includes('tour') || h.includes('cat'));
            
            if (colIndex === -1) colIndex = 0; // Default to first column

            // Extract data starting from row 2 (index 1) if headers exist, otherwise row 1
            const startIndex = 1; 
            
            for (let i = startIndex; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row[colIndex]) {
                    categories.push(String(row[colIndex]).trim());
                }
            }
        }

        // Remove duplicates and creates objects
        const uniqueCategories = Array.from(new Set(categories)).filter(c => c.length > 0);
        
        const categoryObjects: Category[] = uniqueCategories.map(name => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name
        }));

        resolve(categoryObjects);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Helper to export reservations to Excel with tabs corresponding to activities
export const exportToExcel = (reservations: Reservation[]) => {
  const workbook = XLSX.utils.book_new();

  // Helper calculation function
  const processData = (r: Reservation) => {
      const commissionAmount = (r.price * (r.commission || 0)) / 100;
      const netProfit = r.price - r.cost - commissionAmount;

      return {
        'Fecha': r.date,
        'Hora': r.time,
        'Cliente': r.clientName,
        'Estatus': r.status,
        'Vendedor': r.seller,
        'Actividad': r.activity,
        'Responsable': r.responsible,
        'Precio (Ingreso)': r.price,
        'Costo (Pago)': r.cost,
        'Comisión (%)': r.commission,
        'Monto Comisión': commissionAmount,
        'Ganancia Mahana': netProfit,
        'Notas': r.notes || '',
        'Gestionado por': r.managedBy || ''
      };
  };

  // 1. Create a "Master" Sheet with all data
  const masterData = reservations.map(processData);
  const masterSheet = XLSX.utils.json_to_sheet(masterData);
  XLSX.utils.book_append_sheet(workbook, masterSheet, "Todas las Reservas");

  // 2. Create individual sheets for each activity category
  const activities = Array.from(new Set(reservations.map(r => r.activity)));

  activities.forEach(activity => {
    const activityData = reservations
      .filter(r => r.activity === activity)
      .sort((a, b) => {
          // Sort by date then time
          const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
          const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
          return dateA.getTime() - dateB.getTime();
      })
      .map(processData);

    // Sheet names have a 31 char limit and no special chars in Excel
    const safeSheetName = activity.substring(0, 30).replace(/[\\/?*[\]]/g, "");
    
    if (activityData.length > 0) {
        const sheet = XLSX.utils.json_to_sheet(activityData);
        XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName);
    }
  });

  // Write file
  XLSX.writeFile(workbook, "Reservas_Operativas.xlsx");
};
