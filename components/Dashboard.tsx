import React from 'react';
import { Card } from './ui/Card';
import { Bell, Calendar, User, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { Metric } from '../types';

export const Dashboard: React.FC = () => {
  const metrics: Metric[] = [
    { label: "Total Users", value: "12,402", status: "good", trend: 12 },
    { label: "Revenue", value: "$42.5k", status: "good", trend: 8 },
    { label: "Avg Session", value: "4m 12s", status: "neutral", trend: -2 },
    { label: "Bounce Rate", value: "24.5%", status: "warning", trend: 5 },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Header Card */}
      <div className="col-span-12">
        <Card className="bg-gradient-to-r from-app-surface to-app-bg border-l-4 border-l-app-primary">
          <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back, Admin</h1>
                <div className="flex space-x-6 text-app-muted text-sm">
                    <span className="flex items-center gap-2"><Calendar size={14} /> Today, Oct 24</span>
                    <span className="flex items-center gap-2"><User size={14} /> Team Lead</span>
                </div>
            </div>
            <div className="flex gap-4">
                <button className="p-2 bg-app-surface border border-app-border rounded-full text-app-muted hover:text-white transition-colors">
                    <Bell size={18} />
                </button>
            </div>
          </div>
        </Card>
      </div>

      {/* KPI Cards */}
      {metrics.map((m, i) => (
        <div key={i} className="col-span-3">
            <Card className="h-full">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-app-muted font-medium uppercase">{m.label}</span>
                    <Activity size={16} className="text-app-border" />
                </div>
                <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-app-text">{m.value}</span>
                    <span className={`text-xs flex items-center mb-1 ${m.status === 'good' ? 'text-app-success' : m.status === 'warning' ? 'text-app-warning' : 'text-app-danger'}`}>
                        {m.trend && m.trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        {Math.abs(m.trend || 0)}%
                    </span>
                </div>
            </Card>
        </div>
      ))}

      {/* Main Content Area */}
      <div className="col-span-8 h-80">
        <Card title="Activity Feed" className="h-full">
            <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-app-bg/50 transition-colors border border-transparent hover:border-app-border">
                        <div className="w-10 h-10 rounded-full bg-app-primary/10 flex items-center justify-center text-app-primary font-bold">
                            U{i}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-app-text">User action performed</h4>
                            <p className="text-xs text-app-muted">Description of the event that occurred.</p>
                        </div>
                        <span className="text-xs text-app-muted font-mono">2m ago</span>
                    </div>
                ))}
            </div>
        </Card>
      </div>
      
      {/* Sidebar Widget */}
      <div className="col-span-4 h-80">
          <Card title="System Status" className="h-full">
              <div className="space-y-4">
                  <div>
                      <div className="flex justify-between text-xs mb-1">
                          <span className="text-app-muted">Server Load</span>
                          <span className="text-app-primary">42%</span>
                      </div>
                      <div className="w-full bg-app-bg h-2 rounded-full overflow-hidden">
                          <div className="bg-app-primary h-full rounded-full" style={{ width: '42%' }}></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between text-xs mb-1">
                          <span className="text-app-muted">Memory Usage</span>
                          <span className="text-app-secondary">68%</span>
                      </div>
                      <div className="w-full bg-app-bg h-2 rounded-full overflow-hidden">
                          <div className="bg-app-secondary h-full rounded-full" style={{ width: '68%' }}></div>
                      </div>
                  </div>
                   <div>
                      <div className="flex justify-between text-xs mb-1">
                          <span className="text-app-muted">Storage</span>
                          <span className="text-app-success">24%</span>
                      </div>
                      <div className="w-full bg-app-bg h-2 rounded-full overflow-hidden">
                          <div className="bg-app-success h-full rounded-full" style={{ width: '24%' }}></div>
                      </div>
                  </div>
              </div>
          </Card>
      </div>
    </div>
  );
};