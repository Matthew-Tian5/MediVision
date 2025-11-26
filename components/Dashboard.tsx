import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { HistoryRecord, User } from '../types';

interface Props {
  user: User | null;
  history: HistoryRecord[];
  onNewScan: () => void;
  onViewRecord: (record: HistoryRecord) => void;
}

export const Dashboard: React.FC<Props> = ({ user, history, onNewScan, onViewRecord }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Welcome Section - Mobile responsive optimization */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            Welcome back, <span className="text-[#0071e3]">{user?.name || 'User'}</span>.
          </h2>
          <p className="text-[#86868b] mt-1 text-sm sm:text-base">Here is your recent reconciliation activity.</p>
        </div>
        
        {/* Full width button on mobile */}
        <Button onClick={onNewScan} className="w-full md:w-auto shadow-lg shadow-blue-500/20 justify-center">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Reconciliation
        </Button>
      </div>

      {/* History Grid */}
      <div>
        <h3 className="text-lg sm:text-[19px] font-semibold text-[#1D1D1F] mb-4 sm:mb-6 tracking-tight">Recent Schedules</h3>
        
        {history.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
             <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
               <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <p className="text-gray-900 font-medium">No history found</p>
             <p className="text-gray-500 text-sm mt-1 max-w-xs">Start a new analysis to create your first medication schedule.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {history.map((record) => (
              <div 
                key={record.id}
                onClick={() => onViewRecord(record)}
                className="bg-white rounded-[24px] p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {record.scheduleName || 'Unnamed Schedule'}
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  {record.data.medications.length} medications • {record.data.warnings.length} alerts
                </p>

                <div className="flex items-center text-sm font-medium text-blue-500 md:opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View Report
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};