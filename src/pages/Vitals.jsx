import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate, Link, useLocation } from "react-router-dom";

export function Vitals() {
    const patients = useQuery(api?.patients?.getPatients || "patients:getPatients") || [];
    const updatePatient = useMutation(api?.patients?.updatePatient || "patients:updatePatient");
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedId, setSelectedId] = useState(location.state?.patientId || "");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");

    const patient = patients.find(p => p._id === selectedId);
    
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const bmi = (h && w) ? (w / Math.pow(h / 100, 2)).toFixed(1) : "--";

    const bmiVal = parseFloat(bmi);
    let bmiOffset = "50%";
    if (!isNaN(bmiVal)) {
        if (bmiVal < 18.5) {
            bmiOffset = `${(bmiVal / 18.5) * 20}%`;
        } else if (bmiVal < 25) {
            bmiOffset = `${20 + ((bmiVal - 18.5) / 6.5) * 50}%`;
        } else if (bmiVal < 30) {
            bmiOffset = `${70 + ((bmiVal - 25) / 5) * 15}%`;
        } else {
            bmiOffset = `${Math.min(100, 85 + ((bmiVal - 30) / 10) * 15)}%`;
        }
    }

    const handleSave = async () => {
        if (!selectedId) return;
        try {
            if (api?.patients?.updatePatient) {
                await updatePatient({ 
                    id: selectedId, 
                    updates: { height: h, weight: w, bmi: parseFloat(bmi) } 
                });
            }
            navigate("/");
        } catch(e) {
            console.error(e);
            alert("Ensure 'npx convex dev' is running.");
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
            <header className="fixed top-0 w-full z-50 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between px-6 py-3 w-full">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Heritage Logo" className="h-8 w-auto object-contain" />
                        <h1 className="font-headline font-bold text-lg tracking-tight text-blue-800 dark:text-blue-300 font-extrabold tracking-tighter">Heritage Health Fair</h1>
                    </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 h-px w-full"></div>
            </header>

            <main className="flex-grow pt-24 pb-32 px-4 md:px-8 max-w-3xl mx-auto w-full space-y-8">
                <div>
                    <Link to="/" className="flex items-center gap-2 text-primary font-bold group active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        <span className="text-xs uppercase tracking-widest">Back to Visitor List</span>
                    </Link>
                </div>
                
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Station 02</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Vitals Station</h2>
                    <p className="text-on-surface-variant font-medium">Height & Weight Recording</p>
                </div>

                <div className="bg-white rounded-lg p-6 border shadow-sm">
                    <label className="text-sm font-semibold text-on-surface-variant">Select Patient:</label>
                    <select 
                        className="w-full h-14 px-4 mt-2 rounded-lg border border-outline-variant bg-surface text-lg font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
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
                    <div className="space-y-6">
                        <div className="bg-primary-container/30 rounded-xl p-6 border border-primary/10 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 overflow-hidden ring-2 ring-white shadow-sm">
                                    <img alt={`${patient.firstName} ${patient.surname}`} className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB64YsUxdMbDRtdqXdKp34fryqtaYi5O7NiElTTR7_WsRDLuposdiCjZlj3_ROTzk5dwIQTN3PWvvtGIfh-AAB7XT6sqYYJFiUPPWP9Si16jSDj3Ljpts4o-1_UEajnNeOjVsy8KSFdURTsJuYmEyaBmmvq7KOmf3a-Y26kzoQcdPkqxfemBQjsFRGRetUtWrVGqeDuYxI3k4q3hUfxQaImlHImMaqcYlkE9gEJx4e2nyBejZe5wWRDKSULI0l7T_aJ5zT6KISFpQ" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold leading-none text-on-primary-container">{patient.firstName} {patient.surname}</h3>
                                    <p className="text-on-primary-container/70 text-sm mt-1 capitalize">{patient.age || 'N/A'}, {patient.gender}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-4 border-t border-primary/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-primary-container/60">Check-in Time</span>
                                    <span className="font-bold text-on-primary-container">{new Date(patient._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-primary-container/60">Status</span>
                                    <span className="text-success font-extrabold uppercase tracking-tighter text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span> In Progress
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-outline-variant/30 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 mb-2 border-b border-surface-variant pb-4">
                                <span className="material-symbols-outlined text-primary">straighten</span>
                                <h3 className="font-bold text-lg">Measurements</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-on-surface-variant">Height (cm)</label>
                                    <input value={height} onChange={e=>setHeight(e.target.value)} className="w-full h-14 px-4 rounded-lg border border-outline-variant bg-surface text-2xl font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="175" type="number"/>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-on-surface-variant">Weight (kg)</label>
                                    <input value={weight} onChange={e=>setWeight(e.target.value)} className="w-full h-14 px-4 rounded-lg border border-outline-variant bg-surface text-2xl font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="70" type="number"/>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex flex-col items-center md:items-start gap-1">
                                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Calculated BMI</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-6xl font-black text-on-surface tracking-tighter">{bmi}</span>
                                    {bmi !== "--" && (
                                        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success-container text-success text-sm font-bold shadow-sm">
                                            <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                            {bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : "Overweight"}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="w-full md:w-48 space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                                    <span>Under</span><span>Normal</span><span>Over</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full overflow-hidden flex relative bg-surface-variant">
                                    <div className="h-full bg-blue-300 w-[20%]"></div>
                                    <div className="h-full bg-success w-[50%]"></div>
                                    <div className="h-full bg-orange-300 w-[15%]"></div>
                                    <div className="h-full bg-red-400 w-[15%]"></div>
                                    {bmi !== "--" && (
                                        <div className="absolute top-[-2px] h-3.5 w-1.5 bg-slate-800 rounded outline outline-1 outline-white shadow-sm transition-all" style={{left: bmiOffset}}></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button onClick={handleSave} className="w-full h-16 bg-primary text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined">save</span>
                                Save & Proceed
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                        
                        <div className="mt-8">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 px-1">Historical Context</h4>
                            <div className="p-5 bg-white rounded-lg border border-outline-variant/20 border-dashed flex flex-col gap-3">
                                <div className="flex items-center justify-between text-on-surface-variant">
                                    <h5 className="font-bold text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">history</span>
                                        Previous Reading (Nov 2023)
                                    </h5>
                                    <span className="text-xs font-medium">11 months ago</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-surface p-3 rounded-lg border border-outline-variant/10">
                                        <span className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">Weight</span>
                                        <span className="text-lg font-bold">82 kg</span>
                                    </div>
                                    <div className="bg-surface p-3 rounded-lg border border-outline-variant/10">
                                        <span className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">BMI</span>
                                        <span className="text-lg font-bold">24.8</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
