import React from 'react';
import { Card } from './ui/Card';
import { Search, Filter, MoreHorizontal } from 'lucide-react';

const data = [
  { id: 'TRX-9921', name: 'Project Alpha', status: 'Active', category: 'Development', date: '2023-10-24' },
  { id: 'TRX-9922', name: 'Website Redesign', status: 'Pending', category: 'Design', date: '2023-10-25' },
  { id: 'TRX-9923', name: 'Database Migration', status: 'Processing', category: 'Infrastructure', date: '2023-10-26' },
  { id: 'TRX-9924', name: 'Q4 Marketing', status: 'Completed', category: 'Marketing', date: '2023-10-20' },
  { id: 'TRX-9925', name: 'Security Audit', status: 'Active', category: 'Security', date: '2023-10-27' },
  { id: 'TRX-9926', name: 'Client Portal', status: 'Pending', category: 'Development', date: '2023-11-01' },
];

export const DataGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-12 h-full flex flex-col">
        <Card title="Data Management" className="h-full flex flex-col" headerAction={
             <div className="flex gap-2">
                 <button className="p-1.5 text-app-muted hover:text-white bg-app-bg rounded border border-app-border">
                     <Filter size={14} />
                 </button>
                 <button className="p-1.5 text-app-muted hover:text-white bg-app-bg rounded border border-app-border">
                     <Search size={14} />
                 </button>
             </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-app-muted border-b border-app-border bg-app-bg/50">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Project Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-app-bg/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-app-primary">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-app-text">{row.name}</td>
                    <td className="px-4 py-3 text-app-muted">{row.category}</td>
                    <td className="px-4 py-3 text-app-muted font-mono text-xs">{row.date}</td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                            ${row.status === 'Active' ? 'bg-app-success/10 text-app-success' : 
                              row.status === 'Pending' ? 'bg-app-warning/10 text-app-warning' :
                              row.status === 'Processing' ? 'bg-app-primary/10 text-app-primary' :
                              'bg-app-border text-app-muted'}
                        `}>
                            {row.status}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                        <button className="text-app-muted hover:text-white">
                            <MoreHorizontal size={16} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-xs text-app-muted border-t border-app-border pt-4">
              <span>Showing 1-6 of 24 items</span>
              <div className="flex gap-2">
                  <button className="px-3 py-1 bg-app-bg border border-app-border rounded hover:border-app-primary">Prev</button>
                  <button className="px-3 py-1 bg-app-bg border border-app-border rounded hover:border-app-primary">Next</button>
              </div>
          </div>
        </Card>
      </div>
    </div>
  );
};