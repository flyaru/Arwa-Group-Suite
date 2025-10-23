
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TravelerTable from '../components/traveler/TravelerTable';
import TravelerFormModal from '../components/traveler/TravelerFormModal';
import { useApp } from '../contexts/AppContext';
import { Plus } from 'lucide-react';
import type { Traveler } from '../types';

const TravelersPage: React.FC = () => {
    const { travelers, customers, addTraveler } = useApp();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const handleSaveTraveler = (newTravelerData: Omit<Traveler, 'id'>) => {
        addTraveler(newTravelerData);
        setIsFormModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">All Travelers</h2>
                         <Button onClick={() => setIsFormModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Traveler
                        </Button>
                    </div>
                </div>
                <TravelerTable travelers={travelers} customers={customers} />
            </Card>

            <TravelerFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveTraveler}
                customers={customers}
            />
        </div>
    );
};

export default TravelersPage;