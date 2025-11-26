import React from 'react';
import { Medication } from '../types';
import { Card } from './Card';

interface Props {
  medications: Medication[];
  onUpdate: (id: string, field: keyof Medication, value: string) => void;
  highlightedIds?: string[];
}

export const MedicationList: React.FC<Props> = ({ medications, onUpdate, highlightedIds = [] }) => {
  return (
    <Card title="Identified Medications" className="h-full">
      <div className="space-y-3">
        {medications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <p className="text-sm">No medications detected yet.</p>
          </div>
        )}
        {medications.map((med) => {
          const isHighlighted = highlightedIds.includes(med.id);
          const isOTC = med.category === 'OTC';
          
          return (
            <div 
              key={med.id} 
              // Responsive padding
              className={`group relative p-3 sm:p-4 rounded-2xl bg-white border transition-all duration-300 
                ${isHighlighted 
                  ? 'border-red-300 shadow-md shadow-red-100 ring-1 ring-red-200' 
                  : 'border-gray-100 hover:border-blue-200 hover:shadow-sm'
                }`}
            >
              {/* Responsive layout */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                
                {/* Label area */}
                <div className="flex justify-between items-center w-full sm:w-auto order-first sm:order-last">
                    <span className="sm:hidden text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medication Info</span>
                    
                    <span className={`flex-shrink-0 text-[9px] sm:text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider border select-none ${
                      isOTC
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    }`}>
                      {isOTC ? 'Over the Counter' : 'Prescription'}
                    </span>
                </div>

                {/* Input area */}
                <div className="w-full sm:flex-1 min-w-0 space-y-3 sm:space-y-1">
                  {/* Medication name */}
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => onUpdate(med.id, 'name', e.target.value)}
                    // Responsive font size
                    className="block w-full font-semibold text-gray-900 text-sm sm:text-[15px] bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-0 transition-colors px-0 py-0.5 placeholder-gray-300"
                    placeholder="Medication Name"
                  />
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => onUpdate(med.id, 'dosage', e.target.value)}
                      className="w-20 sm:w-24 text-xs text-gray-500 font-medium bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-0 transition-colors px-0 py-0.5"
                      placeholder="Dosage"
                    />
                    {/* Separator dot only visible on desktop */}
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    
                    <div className="flex-1 min-w-[120px] flex items-center gap-1 group/reasoning relative">
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => onUpdate(med.id, 'frequency', e.target.value)}
                        className="w-full text-xs text-gray-500 font-medium bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:ring-0 transition-colors px-0 py-0.5"
                        placeholder="Frequency"
                      />
                      
                      {med.reasoning && (
                        <div className="cursor-help text-blue-400 hover:text-blue-600 p-1">
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           {/* Tooltip positioning */}
                           <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] rounded-xl shadow-xl opacity-0 group-hover/reasoning:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
                              <span className="font-bold text-gray-400 block mb-1 uppercase tracking-wider text-[9px]">AI Reasoning</span>
                              "{med.reasoning}"
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Edit icon: hidden on mobile, visible on desktop */}
              <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity sm:block hidden">
                 <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                 </svg>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};