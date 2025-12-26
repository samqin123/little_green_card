import React from 'react';

interface CancerSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
  disabled: boolean;
}

const CancerSelector: React.FC<CancerSelectorProps> = ({ selectedType, onSelect, disabled }) => {
  return (
    <div className="flex justify-center mb-6 w-full">
      <div className="bg-white p-1 rounded-xl shadow-sm border border-emerald-100 inline-flex w-full sm:w-auto">
        <button
          onClick={() => onSelect('胰腺癌')}
          disabled={disabled}
          className={`flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
            selectedType === '胰腺癌'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
          }`}
        >
          胰腺癌
        </button>
        <button
          onClick={() => onSelect('肺癌')}
          disabled={disabled}
          className={`flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
            selectedType === '肺癌'
              ? 'bg-emerald-500 text-white shadow-md'
              : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
          }`}
        >
          肺癌
        </button>
      </div>
    </div>
  );
};

export default CancerSelector;