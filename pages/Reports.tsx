
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import AgentPerformanceReport from '../components/reports/AgentPerformanceReport';
import CommissionReport from '../components/reports/CommissionReport';
import SalesSummaryReport from '../components/reports/SalesSummaryReport';
import SupplierBillsReport from '../components/reports/SupplierBillsReport';
import ExportButton from '../components/common/ExportButton';
import type { DSR } from '../types';

type ReportType = 'sales_summary' | 'agent_performance' | 'commission_report' | 'supplier_bills';

const ReportsPage: React.FC = () => {
    // FIX: Replaced mockUsers with employees from context.
    const { dsrs, supplierBills, suppliers, employees } = useApp();
    const [reportType, setReportType] = useState<ReportType>('agent_performance');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<any | null>(null);
    const [currentReportType, setCurrentReportType] = useState<ReportType | ''>('');
    
    const userMap = useMemo(() => new Map(employees.map(u => [u.username, u.name])), [employees]);
    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);

    const handleGenerate = () => {
        setIsGenerating(true);
        setReportData(null);
        // Simulate API call
        setTimeout(() => {
            let data: any = null;
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Set to end of day for inclusive filtering

            switch(reportType) {
                case 'agent_performance': {
                    const filteredDsrs = dsrs.filter(d => {
                        const dsrDate = new Date(d.date);
                        return dsrDate >= start && dsrDate <= end;
                    });
                    const agentPerformance: { [key: string]: { agentName: string, totalSales: number, commission: number, dsrCount: number } } = {};
                    filteredDsrs.forEach(dsr => {
                        if (!agentPerformance[dsr.agentUsername]) {
                            agentPerformance[dsr.agentUsername] = {
                                agentName: userMap.get(dsr.agentUsername) || dsr.agentUsername,
                                totalSales: 0,
                                commission: 0,
                                dsrCount: 0
                            };
                        }
                        agentPerformance[dsr.agentUsername].totalSales += dsr.sellingFare;
                        agentPerformance[dsr.agentUsername].commission += dsr.commission;
                        agentPerformance[dsr.agentUsername].dsrCount++;
                    });
                    data = Object.values(agentPerformance);
                    break;
                }
                case 'commission_report': {
                     const filteredDsrs = dsrs.filter(d => {
                        const dsrDate = new Date(d.date);
                        return dsrDate >= start && dsrDate <= end;
                    });
                     // FIX: Added a more specific type for the accumulator object to resolve indexing errors.
                     type AgentCommissionDetails = { agentName: string, total: number } & Record<DSR['serviceType'], number>;
                     const commissionByAgent: { [key: string]: AgentCommissionDetails } = {};
                     filteredDsrs.forEach(dsr => {
                         if (!commissionByAgent[dsr.agentUsername]) {
                             commissionByAgent[dsr.agentUsername] = {
                                 agentName: userMap.get(dsr.agentUsername) || dsr.agentUsername,
                                 flight: 0, hotel: 0, visa: 0, other: 0, total: 0
                             };
                         }
                         commissionByAgent[dsr.agentUsername][dsr.serviceType] += dsr.commission;
                         commissionByAgent[dsr.agentUsername].total += dsr.commission;
                     });
                     data = Object.values(commissionByAgent);
                     break;
                }
                case 'sales_summary': {
                    const filteredDsrs = dsrs.filter(d => {
                        const dsrDate = new Date(d.date);
                        return dsrDate >= start && dsrDate <= end;
                    });
                    // FIX: Used a more specific Record type to ensure type safety when indexing.
                    const salesByService: Record<DSR['serviceType'], number> = { flight: 0, hotel: 0, visa: 0, other: 0 };
                    const summary = filteredDsrs.reduce((acc, dsr) => {
                        acc.totalSales += dsr.sellingFare;
                        acc.totalCommission += dsr.commission;
                        acc.totalVat += dsr.vatOnCommission;
                        salesByService[dsr.serviceType] += dsr.sellingFare;
                        return acc;
                    }, { totalSales: 0, totalCommission: 0, totalVat: 0 });

                    data = {
                        ...summary,
                        dsrCount: filteredDsrs.length,
                        salesByService: Object.entries(salesByService).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })),
                    };
                    break;
                }
                case 'supplier_bills': {
                    const filteredBills = supplierBills.filter(b => {
                        const billDate = new Date(b.date);
                        return billDate >= start && billDate <= end;
                    });
                    const billsBySupplier: { [key: string]: { supplierName: string, totalBilled: number, totalPaid: number, totalUnpaid: number, billCount: number } } = {};
                    filteredBills.forEach(bill => {
                        if (!billsBySupplier[bill.supplierId]) {
                            billsBySupplier[bill.supplierId] = {
                                supplierName: supplierMap.get(bill.supplierId) || 'Unknown Supplier',
                                totalBilled: 0, totalPaid: 0, totalUnpaid: 0, billCount: 0
                            };
                        }
                        const supplierData = billsBySupplier[bill.supplierId];
                        supplierData.totalBilled += bill.total;
                        if (bill.status === 'paid') supplierData.totalPaid += bill.total;
                        else if (bill.status === 'unpaid') supplierData.totalUnpaid += bill.total;
                        supplierData.billCount++;
                    });
                    data = Object.values(billsBySupplier);
                    break;
                }
            }

            setReportData(data);
            setCurrentReportType(reportType);
            setIsGenerating(false);
        }, 1500);
    };

    const getExportData = () => {
        if (!reportData) return [];
        if (currentReportType === 'sales_summary') {
            return reportData.salesByService;
        }
        return reportData;
    };

    const exportColumns = useMemo(() => {
        switch(currentReportType) {
            case 'agent_performance':
                return [
                    { Header: 'Agent Name', accessor: 'agentName' as const },
                    { Header: 'Total Sales (SAR)', accessor: 'totalSales' as const },
                    { Header: 'Commission Earned (SAR)', accessor: 'commission' as const },
                    { Header: 'DSRs Created', accessor: 'dsrCount' as const },
                ];
            case 'commission_report':
                 return [
                    { Header: 'Agent Name', accessor: 'agentName' as const },
                    { Header: 'Flight (SAR)', accessor: 'flight' as const },
                    { Header: 'Hotel (SAR)', accessor: 'hotel' as const },
                    { Header: 'Visa (SAR)', accessor: 'visa' as const },
                    { Header: 'Other (SAR)', accessor: 'other' as const },
                    { Header: 'Total (SAR)', accessor: 'total' as const },
                ];
            case 'supplier_bills':
                return [
                    { Header: 'Supplier Name', accessor: 'supplierName' as const },
                    { Header: 'Total Billed (SAR)', accessor: 'totalBilled' as const },
                    { Header: 'Total Paid (SAR)', accessor: 'totalPaid' as const },
                    { Header: 'Total Unpaid (SAR)', accessor: 'totalUnpaid' as const },
                    { Header: 'Bill Count', accessor: 'billCount' as const },
                ];
            case 'sales_summary':
                 return [
                    { Header: 'Service Type', accessor: 'name' as const },
                    { Header: 'Total Sales (SAR)', accessor: 'value' as const },
                ];
            default:
                return [];
        }
    }, [currentReportType]);
    
    const Input = ({ label, ...props }: any) => (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <input className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80" {...props} />
        </div>
    );
    
    const reportTitle = currentReportType ? `${currentReportType.replace(/_/g, ' ')} Report` : '';

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Generate Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="reportType" className="block text-sm font-medium text-slate-300 mb-1">Report Type</label>
                        <select id="reportType" value={reportType} onChange={e => setReportType(e.target.value as ReportType)} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D10028]/80">
                            <option value="agent_performance">Agent Performance</option>
                            <option value="commission_report">Commission Report</option>
                            <option value="sales_summary">Sales Summary</option>
                            <option value="supplier_bills">Supplier Bills</option>
                        </select>
                    </div>
                    <Input label="Start Date" type="date" value={startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} />
                    <Input label="End Date" type="date" value={endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} />
                    <Button onClick={handleGenerate} disabled={isGenerating || !startDate || !endDate}>
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </Button>
                </div>
            </Card>

            {reportData && (
                <Card className="p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-bold text-white capitalize">{reportTitle}</h3>
                         <ExportButton 
                            data={getExportData()}
                            columns={exportColumns as any}
                            filename={`${currentReportType}_report`}
                         />
                    </div>
                    {currentReportType === 'agent_performance' && <AgentPerformanceReport data={reportData} />}
                    {currentReportType === 'commission_report' && <CommissionReport data={reportData} />}
                    {currentReportType === 'sales_summary' && <SalesSummaryReport data={reportData} />}
                    {currentReportType === 'supplier_bills' && <SupplierBillsReport data={reportData} />}
                </Card>
            )}
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ReportsPage;
