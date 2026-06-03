const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'src/app/doctor/dashboard/page.tsx');
let content = fs.readFileSync(p, 'utf8');

if (!content.includes('QueueStatusDisplay')) {
  content = content.replace(
    /import \{ NowCallingController \} from "@\/features\/doctor\/components\/queue\/NowCallingController";/g,
    `import { QueueStatusDisplay, ClinicStatusToggle, QuickActionPanel } from "@/features/doctor/components/queue/NowCallingController";`
  );
}

const selectRegex = /\{\/\* Operational Status Dropdown Select \*\/\}[\s\S]*?<\/select>\s*<\/div>/;
content = content.replace(selectRegex, '');

const renderQueueStart = content.indexOf('const renderQueue = () => {');
const renderProfileStart = content.indexOf('const renderProfile = () =>');

if (renderQueueStart > -1 && renderProfileStart > -1) {
  const newRenderQueue = `const renderQueue = () => {
    const currentPatient = patients.find(p => p.status === "In-Person") || null;
    const nextPatient = patients.find(p => p.status === "Waiting") || null;
    return (
      <div className="max-w-7xl fade-in flex flex-col gap-10">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <span className="text-primary">Queue</span> Manager
          </h1>
          <div className="flex gap-3">
             <button onClick={() => handleQuickToken(false)} disabled={isProcessingMutation} className="h-11 px-4 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:bg-primary/90 active:scale-95 disabled:opacity-50">Quick Token</button>
             <button onClick={() => handleQuickToken(true)} disabled={isProcessingMutation} className="h-11 px-4 bg-rose-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-rose-700 active:scale-95 disabled:opacity-50 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Emergency</button>
          </div>
        </div>

        {/* SECTION 1: Current Queue Status */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Section 1: Current Queue Status</h2>
          <QueueStatusDisplay 
            currentPatient={currentPatient} 
            nextPatient={nextPatient} 
            waitingCount={queueStats.waiting || 0} 
            emergencyCount={queueStats.emergencyCount || 0} 
          />
        </section>

        {/* SECTION 2: Today's Activity */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Section 2: Today's Activity</h2>
          <QueueStatCards 
            patientsServed={queueStats.completed} 
            currentQueue={queueStats.waiting} 
            noShowCount={queueStats.noShowCount} 
            avgWaitTime={queueStats.avgWaitTime} 
          />
        </section>

        {/* SECTION 3: Clinic Status Controller */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Section 3: Clinic Status Controller</h2>
          <ClinicStatusToggle 
            status={clinicStatus} 
            onStatusChange={(val) => {
              if (val === "SHORT_BREAK") {
                setPromptData({ duration: "30", reason: "Doctor on short break" });
                setStatusPromptMode("SHORT_BREAK");
              } else if (val === "CLINIC_CLOSED") {
                setPromptData({ duration: "", reason: "Clinic Closed Today" });
                setStatusPromptMode("CLINIC_CLOSED");
              } else {
                handleUpdateStatus(val);
              }
            }} 
            isLoading={isProcessingMutation} 
          />
        </section>

        {/* SECTION 4: Quick Actions */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Section 4: Quick Actions</h2>
          <QuickActionPanel 
            onNext={() => handleNextPatient(false)}
            onHold={() => handleNextPatient(true)}
            onNoShow={() => { if(currentPatient) updatePatientStatus(currentPatient.id, "NO_SHOW") }}
            onResume={() => { 
                const held = patients.find(p => p.status === "Held");
                if (held) updatePatientStatus(held.id, "WAITING");
            }}
            isLoading={isProcessingMutation}
          />
        </section>
        
        <WalkInModal 
          isOpen={isWalkInModalOpen}
          onClose={() => setIsWalkInModalOpen(false)}
          onSuccess={mutateQueue}
        />
        <AddPatientModal 
          isOpen={isAddPatientModalOpen}
          onClose={() => setIsAddPatientModalOpen(false)}
          onSuccess={mutateQueue}
        />
        
        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden mb-10 pb-4">
          <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Patient Queue
            </h3>
            <button onClick={() => mutateQueue()} className="text-slate-400 hover:text-primary transition-colors bg-white p-2 border border-slate-200 rounded-lg shadow-sm active:scale-95">
              <RefreshCw className={\`w-4 h-4 \${isValidating ? "animate-spin text-primary" : ""}\`} />
            </button>
          </div>
          <div className="p-2 sm:p-6 pb-4 sm:pb-8">
            <PatientListTable patients={patients} mutateQueue={mutateQueue} isProcessing={isProcessingMutation} />
          </div>
        </div>
      </div>
    );
  };
`;

  content = content.substring(0, renderQueueStart) + newRenderQueue + content.substring(renderProfileStart);
  fs.writeFileSync(p, content, 'utf8');
  console.log('Successfully updated page.tsx renderQueue');
} else {
  console.log('Failed to find render bounds');
}
