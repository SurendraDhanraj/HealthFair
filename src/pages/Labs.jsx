import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate, Link, useLocation } from "react-router-dom";

export function Labs() {
    const patients = useQuery(api?.patients?.getPatients || "patients:getPatients") || [];
    const updatePatient = useMutation(api?.patients?.updatePatient || "patients:updatePatient");
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedId, setSelectedId] = useState(location.state?.patientId || "");
    const [bloodSugar, setBloodSugar] = useState("");
    const [cholesterol, setCholesterol] = useState("");

    const patient = patients.find(p => p._id === selectedId);

    const handleSave = async () => {
        if (!selectedId) return;
        try {
            if (api?.patients?.updatePatient) {
                await updatePatient({ 
                    id: selectedId, 
                    updates: { 
                        bloodSugar: parseFloat(bloodSugar), 
                        cholesterol: parseFloat(cholesterol),
                        status: "completed"
                    } 
                });
            }
            navigate("/");
        } catch(e) {
            console.error(e);
            alert("Ensure 'npx convex dev' is running.");
        }
    };

    return (
        <div className="bg-slate-50 text-on-surface font-body antialiased min-h-screen">
            <style>{`
                .glass-header {
                    background: rgba(253, 251, 255, 0.9);
                    backdrop-filter: blur(12px);
                }
                .range-bar {
                    height: 6px;
                    border-radius: 3px;
                    background: linear-gradient(to right, #4CAF50 0%, #4CAF50 70%, #FFC107 85%, #F44336 100%);
                }
                .range-bar-cholesterol {
                    height: 6px;
                    border-radius: 3px;
                    background: linear-gradient(to right, #4CAF50 0%, #4CAF50 60%, #FFC107 80%, #F44336 100%);
                }
            `}</style>
            
            <header className="fixed top-0 w-full z-50 glass-header border-b border-slate-100 shadow-sm">
                <div className="flex justify-between items-center px-6 py-3 w-full max-w-none">
                    <div className="flex items-center gap-3 shrink-0">
                        <img src="/logo.png" alt="Heritage Logo" className="h-8 w-auto object-contain" />
                        <div>
                            <h1 className="font-headline font-bold text-slate-900 tracking-tight text-lg leading-tight uppercase font-headline">Heritage Health Fair</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-primary/10 rounded-full">
                            <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Station 04</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto pt-20 pb-32 px-4">
                <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm mb-6 mt-4">
                    <label className="text-sm font-semibold text-slate-600">Select Patient:</label>
                    <select 
                        className="w-full h-11 px-4 mt-2 rounded-lg border focus:ring-2 focus:border-primary outline-none bg-surface"
                        value={selectedId} 
                        onChange={e => setSelectedId(e.target.value)}
                    >
                        <option value="">-- Choose Patient --</option>
                        {patients.map(p => (
                            <option key={p._id} value={p._id}>{p.firstName} {p.surname}</option>
                        ))}
                    </select>
                </div>

                {patient && (
                    <>
                        <section className="mb-8 mt-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex gap-5 items-center">
                                    <div className="relative">
                                        <div className="size-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 right-0 size-5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                        <h2 className="font-headline text-2xl font-bold text-slate-900 leading-tight">{patient.firstName} {patient.surname}</h2>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <span className="material-symbols-outlined text-sm">fingerprint</span>
                                                <span>Queue ID: <span className="font-semibold text-slate-700">#{patient._id.slice(-5).toUpperCase()}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-2 px-2">
                                <span className="material-symbols-outlined text-primary font-bold">biotech</span>
                                <h3 className="font-headline text-lg font-bold text-slate-900 uppercase tracking-wide">Laboratory Entry</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Random Blood Sugar</label>
                                        <span className="text-xs font-medium text-slate-400">mg/dL</span>
                                    </div>
                                    <div className="relative flex items-center mb-4">
                                        <input value={bloodSugar} onChange={e=>setBloodSugar(e.target.value)} className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-primary focus:ring-0 rounded-t-lg px-4 py-4 text-2xl font-bold transition-all text-slate-900 placeholder:text-slate-300" placeholder="000" type="number"/>
                                        <span className="material-symbols-outlined absolute right-4 text-slate-300 group-focus-within:text-primary">bloodtype</span>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <div className="range-bar w-full"></div>
                                        {bloodSugar && <div className="absolute top-[-4px] w-1.5 h-3.5 bg-slate-800 rounded outline outline-1 outline-white shadow-sm transition-all duration-300" style={{left: `${Math.min(100, Math.max(0, (bloodSugar / 300) * 100))}%`}}></div>}
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <span>Normal (&lt; 140)</span>
                                            <span>Elevated</span>
                                            <span>Critical</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Cholesterol</label>
                                        <span className="text-xs font-medium text-slate-400">mg/dL</span>
                                    </div>
                                    <div className="relative flex items-center mb-4">
                                        <input value={cholesterol} onChange={e=>setCholesterol(e.target.value)} className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 focus:border-primary focus:ring-0 rounded-t-lg px-4 py-4 text-2xl font-bold transition-all text-slate-900 placeholder:text-slate-300" placeholder="000" type="number"/>
                                        <span className="material-symbols-outlined absolute right-4 text-slate-300 group-focus-within:text-primary">monitor_heart</span>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <div className="range-bar-cholesterol w-full"></div>
                                        {cholesterol && <div className="absolute top-[-4px] w-1.5 h-3.5 bg-slate-800 rounded outline outline-1 outline-white shadow-sm transition-all duration-300" style={{left: `${Math.min(100, Math.max(0, (cholesterol / 400) * 100))}%`}}></div>}
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            <span>Desired (&lt; 200)</span>
                                            <span>Borderline</span>
                                            <span>High Risk</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100/50 flex gap-4 mt-8">
                                <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-slate-900">Entry Protocol</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">Verify measurements twice. Values outside thresholds trigger physician alerts.</p>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>

            {patient && (
                <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
                    <div className="max-w-xl mx-auto flex gap-3">
                        <Link to="/" className="flex-1 items-center justify-center h-14 rounded-2xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex">
                            Cancel
                        </Link>
                        <button onClick={handleSave} className="flex-[2] h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                            <span>Submit Results</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}
