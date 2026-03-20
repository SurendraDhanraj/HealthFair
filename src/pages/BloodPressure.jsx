import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate, Link, useLocation } from "react-router-dom";

export function BloodPressure() {
    const patients = useQuery(api?.patients?.getPatients || "patients:getPatients") || [];
    const updatePatient = useMutation(api?.patients?.updatePatient || "patients:updatePatient");
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedId, setSelectedId] = useState(location.state?.patientId || "");
    const [sys, setSys] = useState("");
    const [dia, setDia] = useState("");
    const [pulse, setPulse] = useState("");

    const patient = patients.find(p => p._id === selectedId);

    const handleSave = async () => {
        if (!selectedId) return;
        try {
            if (api?.patients?.updatePatient) {
                await updatePatient({ 
                    id: selectedId, 
                    updates: { 
                        bpSystolic: parseFloat(sys), 
                        bpDiastolic: parseFloat(dia), 
                        pulse: parseFloat(pulse),
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
        <div className="bg-surface font-body text-on-surface antialiased min-h-screen pb-20">
            <header className="fixed top-0 w-full z-50 bg-slate-50/90 backdrop-blur-xl shadow-sm">
                <div className="flex justify-between items-center px-6 py-3 w-full max-w-none">
                    <div className="flex items-center gap-3 shrink-0">
                        <img src="/logo.png" alt="Heritage Logo" className="h-8 w-auto object-contain" />
                        <div>
                            <h1 className="font-headline font-bold text-slate-900 tracking-tight text-lg leading-tight">Heritage Health Fair</h1>
                        </div>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors active:scale-95 duration-200">
                        <span className="material-symbols-outlined text-slate-500">more_vert</span>
                    </button>
                </div>
                <div className="bg-slate-100 h-px w-full"></div>
            </header>

            <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-6 border shadow-sm mb-6">
                    <label className="text-sm font-semibold text-slate-600">Patient Queue:</label>
                    <select 
                        className="w-full h-14 px-4 mt-2 rounded-lg border border-outline-variant bg-surface text-lg font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={selectedId} 
                        onChange={e => setSelectedId(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {patients.map(p => (
                            <option key={p._id} value={p._id}>{p.firstName} {p.surname}</option>
                        ))}
                    </select>
                </div>

                {patient && (
                    <>
                        <section className="mb-10 text-center">
                            <div className="inline-flex items-center justify-center bg-primary-container/10 px-4 py-1.5 rounded-full mb-4">
                                <span className="text-primary font-headline font-bold tracking-wider text-sm">QUEUE ID: #{patient._id.slice(-5).toUpperCase()}</span>
                            </div>
                            <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">{patient.firstName} {patient.surname}</h2>
                            <p className="text-on-surface-variant font-medium">BP & Pulse Vital Station</p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-[0_8px_32px_rgba(25,28,35,0.06)] border border-outline-variant/10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-3xl">monitor_heart</span>
                                    </div>
                                    <div>
                                        <h3 className="font-headline font-bold text-xl">Blood Pressure</h3>
                                        <p className="text-on-surface-variant text-sm font-medium">Target: &lt; 120/80 mmHg</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1 w-full group">
                                        <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">Systolic</label>
                                        <div className="relative bg-surface-container-high rounded-xl p-4 transition-all duration-300 focus-within:bg-surface-container-lowest border">
                                            <input value={sys} onChange={e=>setSys(e.target.value)} className="w-full bg-transparent border-none p-0 text-5xl font-headline font-extrabold text-on-surface focus:ring-0 placeholder:text-outline-variant/50" placeholder="120" type="number"/>
                                            <span className="absolute right-4 bottom-4 text-outline font-bold text-sm">mmHg</span>
                                            <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 transition-all duration-500 group-focus-within:w-full"></div>
                                        </div>
                                        <div className="mt-4 space-y-1.5 px-1 relative">
                                            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 opacity-80"></div>
                                            {sys && <div className="absolute top-[-4px] w-1.5 h-3.5 bg-slate-800 rounded-sm shadow-sm transition-all duration-300" style={{left: `${Math.min(100, Math.max(0, (sys / 200) * 100))}%`}}></div>}
                                            <div className="flex justify-between text-[10px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                                                <span>Normal</span>
                                                <span>Elevated</span>
                                                <span>Critical</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-outline-variant text-6xl font-thin">/</div>
                                    <div className="flex-1 w-full group">
                                        <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2 ml-1">Diastolic</label>
                                        <div className="relative bg-surface-container-high rounded-xl p-4 transition-all duration-300 focus-within:bg-surface-container-lowest border">
                                            <input value={dia} onChange={e=>setDia(e.target.value)} className="w-full bg-transparent border-none p-0 text-5xl font-headline font-extrabold text-on-surface focus:ring-0 placeholder:text-outline-variant/50" placeholder="80" type="number"/>
                                            <span className="absolute right-4 bottom-4 text-outline font-bold text-sm">mmHg</span>
                                            <div className="absolute bottom-0 left-0 h-0.5 bg-primary w-0 transition-all duration-500 group-focus-within:w-full"></div>
                                        </div>
                                        <div className="mt-4 space-y-1.5 px-1 relative">
                                            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 opacity-80"></div>
                                            {dia && <div className="absolute top-[-4px] w-1.5 h-3.5 bg-slate-800 rounded-sm shadow-sm transition-all duration-300" style={{left: `${Math.min(100, Math.max(0, (dia / 140) * 100))}%`}}></div>}
                                            <div className="flex justify-between text-[10px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                                                <span>Normal</span>
                                                <span>Elevated</span>
                                                <span>Critical</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-[0_8px_32px_rgba(25,28,35,0.06)] border border-outline-variant/10 md:col-span-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-secondary text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
                                    </div>
                                    <h3 className="font-headline font-bold text-lg">Pulse Rate</h3>
                                </div>
                                <div className="group relative">
                                    <div className="bg-surface-container-high rounded-xl p-4 transition-all duration-300 focus-within:bg-surface-container-lowest border">
                                        <input value={pulse} onChange={e=>setPulse(e.target.value)} className="w-full bg-transparent border-none p-0 text-5xl font-headline font-extrabold text-on-surface focus:ring-0 placeholder:text-outline-variant/50" placeholder="72" type="number"/>
                                        <span className="absolute right-4 bottom-4 text-outline font-bold text-sm">BPM</span>
                                        <div className="absolute bottom-0 left-0 h-0.5 bg-secondary w-0 transition-all duration-500 group-focus-within:w-full"></div>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1.5 px-1 relative">
                                    <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 opacity-80"></div>
                                    {pulse && <div className="absolute top-[-4px] w-1.5 h-3.5 bg-slate-800 rounded-sm shadow-sm transition-all duration-300" style={{left: `${Math.min(100, Math.max(0, (pulse / 150) * 100))}%`}}></div>}
                                    <div className="flex justify-between text-[10px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                                        <span>Low</span>
                                        <span>Normal</span>
                                        <span>High</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary p-8 rounded-3xl shadow-xl flex flex-col justify-between text-on-primary md:col-span-2">
                                <div>
                                    <h3 className="font-headline font-bold text-lg mb-2">Observation Notes</h3>
                                    <p className="text-primary-fixed text-sm leading-relaxed">Ensure the patient is seated comfortably with feet flat on the floor before recording.</p>
                                </div>
                                <div className="mt-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    <span className="text-xs font-medium uppercase tracking-wider">Calibration Verified</span>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col gap-4 md:col-span-2">
                                <button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-5 rounded-full text-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    Save Vitals to Record
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                                <Link to="/" className="w-full bg-transparent text-primary font-headline font-bold py-4 rounded-full text-sm hover:bg-primary/5 transition-colors text-center border">
                                    Cancel & Reset
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
