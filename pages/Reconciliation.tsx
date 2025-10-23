
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import StatementUpload from '../components/reconciliation/StatementUpload';
import ReconciliationResults from '../components/reconciliation/ReconciliationResults';
import { useApp } from '../contexts/AppContext';
import { DSR, ReconciliationResult } from '../types';

// This is a mock response that simulates the output from the Gemini API
const mockAiResponse: ReconciliationResult = {
  matched: [
    { statementLine: "TICKET 157-9876543210, PNR FG2HIJ, AMOUNT 4500.00", dsrId: "DSR-002", pnr: "FG2HIJ", amount: 4500.00 },
    { statementLine: "HOTEL JEDDAH HILTON, PNR HLMNO4, AMOUNT 1700.00", dsrId: "DSR-003", pnr: "HLMNO4", amount: 1700.00 },
  ],
  unmatchedInStatement: [
    { line: "TICKET 157-1122334455, PNR QW6ERT, AMOUNT 1250.00", reason: "No matching DSR found for this ticket number or PNR." },
  ],
  unmatchedInDSRs: [
     { line: "DSR DSR-001, PNR AB1CDE, AMOUNT 2300.00", reason: "This DSR was not found in the provided statement." },
  ],
};


const ReconciliationPage: React.FC = () => {
    const { suppliers, dsrs } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<ReconciliationResult | null>(null);

    const handleReconcile = async (supplierId: string, statementContent: string) => {
        setIsLoading(true);
        setResults(null);

        const supplierDSRs = dsrs.filter(d => d.supplierId === supplierId);
        
        // --- AI Simulation ---
        // In a real application, you would send the statementContent and supplierDSRs
        // to the Gemini API with a carefully crafted prompt.
        console.log("--- Sending to AI (Simulation) ---");
        console.log("Supplier ID:", supplierId);
        console.log("Statement Content Snippet:", statementContent.substring(0, 200) + "...");
        console.log("Number of DSRs to check:", supplierDSRs.length);
        console.log("--- End of AI Input ---");

        // Simulate network delay and AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Use the mock response
        const aiResult = mockAiResponse;
        
        console.log("--- AI Response Received (Simulation) ---", aiResult);
        
        setResults(aiResult);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-white mb-2">AI Supplier Statement Reconciliation</h2>
                    <p className="text-slate-400 mb-6">
                        Upload a supplier statement in plain text or CSV format. The AI will analyze the statement and reconcile it against your existing DSRs for the selected supplier, highlighting any discrepancies.
                    </p>
                </div>
                <StatementUpload suppliers={suppliers} onReconcile={handleReconcile} isLoading={isLoading} />
            </Card>

            {results && <ReconciliationResults results={results} />}
        </div>
    );
};

export default ReconciliationPage;
