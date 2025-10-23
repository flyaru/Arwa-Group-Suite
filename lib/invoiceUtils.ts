const INVOICE_COUNTER_KEY = 'arwa_invoice_counter';
const INVOICE_YEAR_KEY = 'arwa_invoice_year';

export const generateNextInvoiceNumber = (): string => {
    const currentYear = new Date().getFullYear();
    
    let lastYearStr = localStorage.getItem(INVOICE_YEAR_KEY);
    let counter = 1;

    if (lastYearStr && parseInt(lastYearStr, 10) === currentYear) {
        const lastCounterStr = localStorage.getItem(INVOICE_COUNTER_KEY);
        if (lastCounterStr) {
            counter = parseInt(lastCounterStr, 10) + 1;
        }
    }
    // If it's a new year, the counter is already reset to 1

    localStorage.setItem(INVOICE_YEAR_KEY, String(currentYear));
    localStorage.setItem(INVOICE_COUNTER_KEY, String(counter));

    const formattedCounter = String(counter).padStart(4, '0');
    return `INV-${currentYear}-${formattedCounter}`;
};
