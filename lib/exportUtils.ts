// A generic type for the data array
type DataObject = { [key: string]: any };

// Column definition
interface Column<T> {
    accessor: keyof T;
    Header: string;
}

// Function to convert data to CSV format
// FIX: Made the function generic to ensure type safety for accessors and fix indexing error on line 15.
const convertToCSV = <T extends DataObject>(data: T[], columns: Column<T>[]): string => {
    const header = columns.map(c => c.Header).join(',');
    const rows = data.map(row => {
        return columns.map(col => {
            const cell = row[col.accessor];
            // FIX: An empty string cannot be assigned to 'cell' which is of generic type T[keyof T].
            // Instead, create a new variable 'cellString' and handle null/undefined values there to avoid a type error.
            const cellString = (cell === null || cell === undefined) ? '' : String(cell);
            
            // Escape commas and quotes
            if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
                return `"${cellString.replace(/"/g, '""')}"`;
            }
            return cellString;
        }).join(',');
    });
    return [header, ...rows].join('\n');
};

// Function to trigger CSV download
// FIX: Made the function generic to pass correct types to convertToCSV.
export const exportToCsv = <T extends DataObject>(data: T[], columns: Column<T>[], filename: string) => {
    const csvString = convertToCSV(data, columns);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Function to prepare and trigger PDF print
// FIX: Made the function generic to ensure type safety for accessors and fix indexing error on line 56.
export const exportToPdf = <T extends DataObject>(data: T[], columns: Column<T>[], title: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Could not open print window. Please disable your pop-up blocker.');
        return;
    }
    
    const tableHeader = columns.map(c => `<th>${c.Header}</th>`).join('');
    const tableBody = data.map(row => {
        const rowCells = columns.map(col => `<td>${row[col.accessor] ?? ''}</td>`).join('');
        return `<tr>${rowCells}</tr>`;
    }).join('');

    const htmlContent = `
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    h1 { text-align: center; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <table>
                    <thead>
                        <tr>${tableHeader}</tr>
                    </thead>
                    <tbody>
                        ${tableBody}
                    </tbody>
                </table>
            </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500); // Timeout to ensure content is loaded
};