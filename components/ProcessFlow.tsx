import React from 'react';
import { Card } from './ui/Card';
import { ArrowRight, CheckCircle, Circle, Database, Server, Globe } from 'lucide-react';

export const ProcessFlow: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Workflow Diagram */}
      <div className="col-span-12 h-40">
        <Card className="h-full flex items-center justify-around bg-gradient-to-r from-app-surface to-app-bg border border-app-border">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-app-primary/20 flex items-center justify-center text-app-primary mb-2">
                    <Database size={20} />
                </div>
                <div className="text-xs font-medium text-app-text">Source</div>
            </div>
            
            <div className="h-0.5 flex-1 bg-app-border mx-4 relative">
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full flex justify-center">
                    <ArrowRight size={14} className="text-app-muted" />
                </div>
            </div>
            
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-app-secondary/20 flex items-center justify-center text-app-secondary mb-2">
                    <Server size={20} />
                </div>
                <div className="text-xs font-medium text-app-text">Processing</div>
            </div>

            <div className="h-0.5 flex-1 bg-app-border mx-4 relative">
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full flex justify-center">
                     <ArrowRight size={14} className="text-app-muted" />
                </div>
            </div>

             <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-app-success/20 flex items-center justify-center text-app-success mb-2">
                    <Globe size={20} />
                </div>
                <div className="text-xs font-medium text-app-text">Deploy</div>
            </div>
        </Card>
      </div>

      {/* Step Details */}
      <div className="col-span-8">
          <Card title="Configuration Steps" className="h-[400px]">
              <div className="space-y-6">
                  <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                          <CheckCircle className="text-app-success" size={20} />
                          <div className="w-0.5 h-full bg-app-border my-1"></div>
                      </div>
                      <div className="pb-6">
                          <h4 className="text-sm font-medium text-app-text">Initialize Environment</h4>
                          <p className="text-xs text-app-muted mt-1">Setup variables and base configuration.</p>
                      </div>
                  </div>
                   <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full border-2 border-app-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-app-primary"></div>
                          </div>
                          <div className="w-0.5 h-full bg-app-border my-1"></div>
                      </div>
                      <div className="pb-6">
                          <h4 className="text-sm font-medium text-app-text">Data Validation</h4>
                          <p className="text-xs text-app-muted mt-1">Running integrity checks on input streams.</p>
                          <div className="mt-2 bg-app-bg p-2 rounded text-xs font-mono text-app-muted">
                              > Checking schema... OK<br/>
                              > Verifying types... OK
                          </div>
                      </div>
                  </div>
                   <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                           <Circle className="text-app-muted" size={20} />
                      </div>
                      <div>
                          <h4 className="text-sm font-medium text-app-muted">Finalize Build</h4>
                          <p className="text-xs text-app-muted mt-1 opacity-50">Pending previous steps.</p>
                      </div>
                  </div>
              </div>
          </Card>
      </div>

      <div className="col-span-4">
          <Card title="Parameters">
             <div className="space-y-4">
                 <div className="space-y-1">
                     <label className="text-xs text-app-muted">Environment</label>
                     <select className="w-full bg-app-bg border border-app-border rounded p-2 text-sm text-app-text outline-none focus:border-app-primary">
                         <option>Production</option>
                         <option>Staging</option>
                         <option>Development</option>
                     </select>
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs text-app-muted">Timeout (ms)</label>
                     <input type="number" className="w-full bg-app-bg border border-app-border rounded p-2 text-sm text-app-text outline-none focus:border-app-primary" defaultValue="5000" />
                 </div>
                 <button className="w-full py-2 bg-app-primary text-white rounded font-medium text-sm mt-4 hover:bg-indigo-600 transition-colors">
                     Execute Pipeline
                 </button>
             </div>
          </Card>
      </div>
    </div>
  );
};