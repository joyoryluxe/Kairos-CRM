import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, summaryData?: Record<string, any>) => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert the JSON data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-adjust column widths based on content
  const columnWidths = Object.keys(data[0] || {}).map((key) => {
    const headerLen = key.length;
    // Find the max length in this column
    const maxDataLen = data.reduce((max, row) => {
      const val = row[key] ? row[key].toString() : '';
      return Math.max(max, val.length);
    }, 0);
    return { wch: Math.max(headerLen, maxDataLen) + 2 }; // +2 padding
  });
  worksheet['!cols'] = columnWidths;

  // Append the data worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // If summary data exists, create a second sheet for it
  if (summaryData && Object.keys(summaryData).length > 0) {
    const summaryArray = Object.keys(summaryData).map(key => ({
      Metric: key,
      Value: summaryData[key]
    }));
    const summarySheet = XLSX.utils.json_to_sheet(summaryArray);
    
    // Slight column width adjustment for summary
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
