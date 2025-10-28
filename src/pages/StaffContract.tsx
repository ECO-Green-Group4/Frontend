import React, { useState } from 'react';
import Header from '@/components/ui/Header';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { showToast } from '@/utils/toast';

interface ContractTerm {
  id: string;
  label: string;
  checked: boolean;
}

interface ContractSection {
  party: string;
  terms: ContractTerm[];
}

const StaffContract: React.FC = () => {
  // Debug: Log when component loads
  console.log('StaffContract component loaded!');
  
  const [contractSections, setContractSections] = useState<ContractSection[]>([
    {
      party: 'A',
      terms: [
        { id: 'quality-test-a', label: 'Quality Test', checked: false },
        { id: 'transfer-ownership-a', label: 'Transferring Ownership', checked: false },
        { id: 'faraway-shipping-a', label: 'Faraway Shipping', checked: false },
        { id: 'vat-value-a', label: 'VAT value (2%)', checked: false },
      ]
    },
    {
      party: 'B',
      terms: [
        { id: 'quality-test-b', label: 'Quality Test', checked: false },
        { id: 'transfer-ownership-b', label: 'Transferring Ownership', checked: false },
        { id: 'faraway-shipping-b', label: 'Faraway Shipping', checked: false },
        { id: 'vat-value-b', label: 'VAT value (2%)', checked: false },
      ]
    }
  ]);

  const handleTermToggle = (partyIndex: number, termId: string) => {
    setContractSections(prev => 
      prev.map((section, index) => 
        index === partyIndex 
          ? {
              ...section,
              terms: section.terms.map(term =>
                term.id === termId 
                  ? { ...term, checked: !term.checked }
                  : term
              )
            }
          : section
      )
    );
  };

  const handlePayment = () => {
    // Handle payment logic here
    console.log('Payment initiated');
    showToast('Payment functionality will be implemented', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <Header />
      
      {/* Page Title */}
      <div className="bg-gray-800 text-white py-2 px-6">
        <h1 className="text-lg font-semibold">Staff - Contract</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-12">
          {/* Contract Title */}
          <h2 className="text-4xl font-bold text-black mb-12 text-center">Contract</h2>
          
          {/* Contract Sections */}
          <div className="flex items-start gap-16 mb-12">
            {/* Section A */}
            <div className="flex-1 space-y-8">
              <h3 className="text-3xl font-bold text-black mb-6 text-center">
                A
              </h3>
              
              <div className="space-y-6">
                {contractSections[0].terms.map((term) => (
                  <div key={term.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => handleTermToggle(0, term.id)}
                      className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        term.checked 
                          ? 'bg-green-500 border-green-500 text-white shadow-md' 
                          : 'bg-white border-gray-300 hover:border-green-400 hover:shadow-sm'
                      }`}
                    >
                      {term.checked && <Check className="w-5 h-5" />}
                    </button>
                    <span className="text-xl text-black font-medium">
                      {term.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Divider/Content */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-px h-64 bg-gray-300 mb-6"></div>
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">Contract Agreement</p>
                <p className="text-sm text-gray-500">Select terms for both parties</p>
              </div>
              
            </div>

            {/* Section B */}
            <div className="flex-1 space-y-8">
              <h3 className="text-3xl font-bold text-black mb-6 text-center">
                B
              </h3>
              
              <div className="space-y-6">
                {contractSections[1].terms.map((term) => (
                  <div key={term.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => handleTermToggle(1, term.id)}
                      className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        term.checked 
                          ? 'bg-green-500 border-green-500 text-white shadow-md' 
                          : 'bg-white border-gray-300 hover:border-green-400 hover:shadow-sm'
                      }`}
                    >
                      {term.checked && <Check className="w-5 h-5" />}
                    </button>
                    <span className="text-xl text-black font-medium">
                      {term.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="flex justify-end mt-8">
            <Button
              onClick={handlePayment}
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 text-xl font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffContract;
