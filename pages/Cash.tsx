
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, DollarSign, Hourglass } from 'lucide-react';
import CashHandoverTable from '../components/cash/CashHandoverTable';
import CashHandoverFormModal from '../components/cash/CashHandoverFormModal';
import AgentCashLedger from '../components/cash/AgentCashLedger';

const CashPage: React.FC = () => {
    const { user } = useAuth();
    const { dsrs, cashHandovers, initiateHandover, confirmHandover } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { cashInHand, totalPending, agentLedger } = useMemo(() => {
        if (!user || user.role !== 'agent') return { cashInHand: 0, totalPending: 0, agentLedger: [] };
        
        const myCashDsrs = dsrs.filter(d => d.agentUsername === user.username && d.paymentMethod === 'cash');
        const myHandovers = cashHandovers.filter(h => h.agentId === user.id);

        const ledger: { date: string, description: string, debit: number, credit: number }[] = [];

        myCashDsrs.forEach(dsr => {
            ledger.push({
                date: dsr.date,
                description: `Cash Sale DSR: ${dsr.id} (PNR: ${dsr.pnr})`,
                debit: dsr.sellingFare,
                credit: 0
            });
        });

        myHandovers.forEach(h => {
             ledger.push({
                date: new Date(h.dateInitiated).toISOString().split('T')[0],
                description: `Handover ID: ${h.id} (${h.status})`,
                debit: 0,
                credit: h.amount
            });
        });
        
        ledger.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let runningBalance = 0;
        const ledgerWithBalance = ledger.map(item => {
            runningBalance += item.debit - item.credit;
            return { ...item, balance: runningBalance };
        });


        const totalCashCollected = myCashDsrs.reduce((sum, dsr) => sum + dsr.sellingFare, 0);
        const totalCashHandedOver = myHandovers.reduce((sum, h) => sum + h.amount, 0);

        const pendingAmount = myHandovers
            .filter(h => h.status === 'pending')
            .reduce((sum, h) => sum + h.amount, 0);

        return {
            cashInHand: totalCashCollected - totalCashHandedOver,
            totalPending: pendingAmount,
            agentLedger: ledgerWithBalance.reverse(),
        };
    }, [dsrs, cashHandovers, user]);

    const handleInitiateHandover = (amount: number) => {
        if (!user) return;
        initiateHandover({
            agentId: user.id,
            agentName: user.name,
            amount,
        });
        setIsModalOpen(false);
    };
    
    const handleConfirmHandover = (handoverId: string) => {
        if (!user) return;
        confirmHandover(handoverId, user.id, user.name);
    };

    const canInitiate = user?.role === 'agent' && cashInHand > 0;
    const canConfirm = user && ['admin', 'manager', 'accountant'].includes(user.role);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Cash Management</h1>
                    <p className="text-sm text-slate-400">Track and manage cash handovers.</p>
                </div>
                {canInitiate && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Initiate Handover
                    </Button>
                )}
            </div>

            {user?.role === 'agent' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/20 text-green-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">My Cash-in-Hand</p>
                                <p className="text-2xl font-bold text-white mt-1">SAR {cashInHand.toFixed(2)}</p>
                            </div>
                        </div>
                    </Card>
                     <Card className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-500/20 text-amber-400">
                                <Hourglass className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400 font-medium">My Pending Handovers</p>
                                <p className="text-2xl font-bold text-white mt-1">SAR {totalPending.toFixed(2)}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
            
            {user?.role === 'agent' && (
                <Card>
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg font-bold text-white">My Cash Ledger</h2>
                    </div>
                    <AgentCashLedger ledger={agentLedger} />
                </Card>
            )}

            <Card>
                 <div className="p-4 sm:p-6">
                    <h2 className="text-lg font-bold text-white">Handover History</h2>
                </div>
                <CashHandoverTable
                    handovers={cashHandovers}
                    canConfirm={canConfirm}
                    onConfirm={handleConfirmHandover}
                />
            </Card>

            <CashHandoverFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleInitiateHandover}
                maxAmount={cashInHand}
            />
        </div>
    );
};

export default CashPage;
