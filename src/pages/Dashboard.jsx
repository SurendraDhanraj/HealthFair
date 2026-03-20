import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { useState } from "react";

export function Dashboard() {
    const patients = useQuery(api.patients.getPatients) || [];
    const updatePatient = useMutation(api?.patients?.updatePatient || "patients:updatePatient");
    const [activeTab, setActiveTab] = useState('waitlist');

    const handleComplete = async (id) => {
        try {
            await updatePatient({ id, updates: { status: "finalized" } });
        } catch(e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm shadow-blue-900/5">
                <div className="flex items-center justify-between px-6 py-4 max-w-full mx-auto">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <img src="/logo.png" alt="Heritage Logo" className="h-8 sm:h-10 w-auto object-contain" />
                        <h1 className="font-headline font-bold text-lg sm:text-2xl tracking-tighter text-blue-800 dark:text-blue-200 truncate max-w-[120px] sm:max-w-none">Heritage Health Fair</h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab('waitlist')} className={`font-bold py-1 border-b-2 transition-all whitespace-nowrap text-xs sm:text-sm md:text-base ${activeTab === 'waitlist' ? 'text-blue-700 dark:text-blue-400 border-blue-600 px-2' : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 rounded-lg'}`}>Waitlist</button>
                        <button onClick={() => setActiveTab('completed')} className={`font-bold py-1 border-b-2 transition-all whitespace-nowrap text-xs sm:text-sm md:text-base ${activeTab === 'completed' ? 'text-blue-700 dark:text-blue-400 border-blue-600 px-2' : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 rounded-lg'}`}>Completed</button>
                        <button onClick={() => setActiveTab('analytics')} className={`font-bold py-1 border-b-2 transition-all whitespace-nowrap text-xs sm:text-sm md:text-base ${activeTab === 'analytics' ? 'text-blue-700 dark:text-blue-400 border-blue-600 px-2' : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 rounded-lg'}`}>Analytics</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="material-symbols-outlined text-on-surface-variant hover:bg-blue-50 p-2 rounded-full transition-colors">notifications</button>
                        <div className="h-10 w-10 rounded-full bg-primary-container overflow-hidden ring-2 ring-white shadow-sm">
                            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcf2a8KwLgGrVaAlk1njptYYes9RqlSIn4kgkFHudpR27S-kT8D-Y7PRcdEiZ19E5sIzVreGZZCvDgOVW1JQ83x-IitfefU8f9iUaiLKg4o2042N0UUaKnsWBPf0GT0x38_CotDAmTQD2nwwTGfpGr7nh9pPNUWbsw2NCLK7XPTwCm8nuQ02iJRkdk8jy8CifGPpitcJB7_qUbPWCdpTlpj8VJbXdjiTr0P9d1hecS_1mUW4pa8RXGQKLjxTqHOczcYuIUyo-VXRE"/>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 h-px w-full"></div>
            </nav>

            <main className="pt-24 pb-24 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
                    <div className="relative w-full md:max-w-md group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                        <input className="w-full bg-surface-container-high border-none border-b-2 border-transparent focus:ring-0 focus:border-primary rounded-t-xl py-4 pl-12 pr-4 font-body text-on-surface placeholder:text-on-surface-variant/60 transition-all" placeholder="Search patients by name or ID..." type="text"/>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Link to="/registration" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold px-8 py-4 rounded-full shadow-lg shadow-primary/20 active:scale-95 transition-transform text-center mx-auto whitespace-nowrap">
                            <span className="material-symbols-outlined text-white">person_add</span>
                            <span className="text-white">New Intake</span>
                        </Link>
                        <button className="md:flex-none p-4 rounded-full bg-surface-container-lowest text-primary border border-outline-variant/20 shadow-sm active:scale-95 transition-transform">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                    </div>
                </div>

                {activeTab === 'waitlist' && <WaitlistView patients={patients} handleComplete={handleComplete} />}
                {activeTab === 'completed' && <CompletedView patients={patients} />}
                {activeTab === 'analytics' && <AnalyticsView patients={patients} />}
            </main>
        </div>
    );
}

function StationRow({name, isDone, path, patientId}) {
    if (isDone) {
        return (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                    <span className="font-semibold text-sm">{name}</span>
                </div>
                <span className="text-xs font-bold text-secondary uppercase tracking-tighter">Done</span>
            </div>
        );
    }
    return (
        <Link to={path} state={{ patientId }} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:bg-surface hover:shadow-sm transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">pending</span>
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{name}</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter group-hover:text-primary transition-colors flex items-center gap-1">Pending <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all">arrow_forward</span></span>
        </Link>
    );
}

function WaitlistView({ patients, handleComplete }) {
    const waitlist = patients.filter(p => p.status !== 'finalized');
    
    return (
        <>
            <div className="mb-8">
                <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Active Waitlist</h2>
                <p className="text-on-surface-variant font-body mt-2">Managing {waitlist.length} patients across triage stations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {waitlist.map(p => {
                    const hasVitals = p.height && p.weight;
                    const hasBP = p.bpSystolic && p.pulse;
                    const hasLabs = p.bloodSugar && p.cholesterol;
                    const isCompleted = hasVitals && hasBP && hasLabs;

                    return (
                        <div key={p._id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_8px_32px_rgba(25,28,35,0.04)] hover:shadow-[0_8px_32px_rgba(25,28,35,0.08)] transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">ID: #{p._id.slice(-5).toUpperCase()}</span>
                                    <h3 className="font-headline text-xl font-bold mt-2 text-on-surface">{p.firstName} {p.surname}</h3>
                                    <p className="text-sm text-on-surface-variant">Arrival: {new Date(p._creationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isCompleted ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed'}`}>
                                        {isCompleted ? 'Ready' : 'Pending'}
                                    </div>
                                    {isCompleted && (
                                        <Link to={`/report/${p._id}`} className="text-xs font-bold text-primary hover:text-blue-800 underline underline-offset-2 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> View Report
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <StationRow name="Vitals" path="/vitals" isDone={hasVitals} patientId={p._id} />
                                <StationRow name="BP & Pulse" path="/bp" isDone={hasBP} patientId={p._id} />
                                <StationRow name="Lab Results" path="/labs" isDone={hasLabs} patientId={p._id} />
                            </div>
                            {isCompleted && (
                                <button onClick={() => handleComplete(p._id)} className="w-full mt-6 py-3 rounded-lg bg-secondary text-on-secondary font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
                                    COMPLETE CHECK-IN
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function CompletedView({ patients }) {
    const finalized = patients.filter(p => p.status === 'finalized');
    return (
        <>
            <div className="mb-8">
                <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Completed Screenings</h2>
                <p className="text-on-surface-variant font-body mt-2">Showing {finalized.length} finalized patient records</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {finalized.map(p => (
                    <div key={p._id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-[0_8px_32px_rgba(25,28,35,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">ID: #{p._id.slice(-5).toUpperCase()}</span>
                                    <h3 className="font-headline text-xl font-bold mt-2 text-on-surface">{p.firstName} {p.surname}</h3>
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Checked Out
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">BP</span>
                                    <p className="font-semibold text-sm">{p.bpSystolic}/{p.bpDiastolic}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Sugar</span>
                                    <p className="font-semibold text-sm">{p.bloodSugar}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Cholesterol</span>
                                    <p className="font-semibold text-sm">{p.cholesterol}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">BMI</span>
                                    <p className="font-semibold text-sm">{p.bmi}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-outline-variant/10 flex gap-3">
                            <Link to={`/report/${p._id}`} className="flex-1 bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">visibility</span> View Record
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

function AnalyticsView({ patients }) {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const filtered = patients.filter(p => {
        if (p.status !== 'finalized') return false;
        const creationDate = new Date(p._creationTime).toISOString().split('T')[0];
        return creationDate >= startDate && creationDate <= endDate;
    });

    const total = filtered.length;
    const highBP = filtered.filter(p => p.bpSystolic > 140 || p.bpDiastolic > 90).length;
    const highSugar = filtered.filter(p => p.bloodSugar > 140).length;
    const highChol = filtered.filter(p => p.cholesterol > 200).length;
    const highBMI = filtered.filter(p => p.bmi >= 25).length;
    
    const allFourHigh = filtered.filter(p => 
        (p.bpSystolic > 140 || p.bpDiastolic > 90) && 
        p.bloodSugar > 140 && 
        p.cholesterol > 200 && 
        (p.bmi && p.bmi >= 25)
    ).length;

    const anyThreeHigh = filtered.filter(p => {
        let factors = 0;
        if (p.bpSystolic > 140 || p.bpDiastolic > 90) factors++;
        if (p.bloodSugar > 140) factors++;
        if (p.cholesterol > 200) factors++;
        if (p.bmi && p.bmi >= 25) factors++;
        return factors >= 3;
    }).length;

    const elevatedRisk = filtered.filter(p => (p.bpSystolic > 140 || p.bpDiastolic > 90) || p.bloodSugar > 140 || p.cholesterol > 200 || (p.bmi && p.bmi >= 25)).length;

    return (
        <>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Fair Analytics</h2>
                    <p className="text-on-surface-variant font-body mt-2">Summary metrics for {total} completed screenings</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 bg-surface-container-high p-4 rounded-2xl border border-outline-variant/10 shadow-sm">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">From</span>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">To</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
            
            {total === 0 ? (
                <div className="bg-surface-container-lowest border border-dashed border-outline-variant/30 rounded-3xl p-20 flex flex-col items-center justify-center text-center opacity-60">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4" style={{fontVariationSettings: "'wght' 200"}}>analytics</span>
                    <h3 className="text-xl font-headline font-bold text-on-surface">No data found</h3>
                    <p className="max-w-xs text-sm text-on-surface-variant mt-2">There are no completed screenings recorded within this date range.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <StatCard title="Total Screened" value={total} icon="groups" color="text-primary" bg="bg-primary/10" />
                    <StatCard title="High BP Alert" value={highBP} icon="monitor_heart" color="text-orange-600" bg="bg-orange-600/10" />
                    <StatCard title="High Blood Sugar" value={highSugar} icon="water_drop" color="text-purple-600" bg="bg-purple-600/10" />
                    <StatCard title="High Cholesterol" value={highChol} icon="science" color="text-indigo-600" bg="bg-indigo-600/10" />
                    <StatCard title="High BMI Count" value={highBMI} icon="fitness_center" color="text-amber-600" bg="bg-amber-600/10" />
                    <StatCard title="Elevated Risk" value={elevatedRisk} icon="warning_amber" color="text-error" bg="bg-error/10" />
                    <StatCard title="Critical 3-Factor" value={anyThreeHigh} icon="priority_high" color="text-orange-700" bg="bg-orange-100 border border-orange-200" />
                    <StatCard title="Extreme 4-Factor" value={allFourHigh} icon="emergency_home" color="text-white bg-error" bg="bg-error shadow-lg shadow-error/30" />
                </div>
            )}

            {total > 0 && <HourlyVisitorChart filteredPatients={filtered} />}
            {total > 0 && <AnalyticsTable patients={filtered} />}
        </>
    );
}

function AnalyticsTable({ patients }) {
    const sorted = [...patients].sort((a, b) => b._creationTime - a._creationTime);

    const exportToCSV = () => {
        const headers = ["Time", "First Name", "Surname", "Gender", "DOB", "Email", "Height", "Weight", "BMI", "BP Systolic", "BP Diastolic", "Blood Sugar", "Cholesterol"];
        const rows = sorted.map(p => [
            new Date(p._creationTime).toLocaleString(),
            p.firstName,
            p.surname,
            p.gender,
            p.dob || "",
            p.email || "",
            p.height || "",
            p.weight || "",
            p.bmi || "",
            p.bpSystolic || "",
            p.bpDiastolic || "",
            p.bloodSugar || "",
            p.cholesterol || ""
        ]);

        const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Heritage_Health_Fair_Export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-surface-container-lowest border border-outline-variant/10 shadow-sm rounded-3xl overflow-hidden mt-8 animate-in slide-in-from-bottom-6 duration-1000">
            <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
                <h3 className="text-lg font-headline font-bold flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-primary">clinical_notes</span>
                    Visitor Clinical Registry
                </h3>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-outline-variant/20 px-4 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-green-600 text-sm">download</span>
                        Export CSV
                    </button>
                    <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full uppercase tracking-widest shadow-inner">
                        {sorted.length} Global Records
                    </span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-high/40 text-on-surface-variant uppercase text-[10px] font-bold tracking-widest">
                            <th className="px-6 py-4 border-r border-outline-variant/5">Time</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4 text-center">Sex</th>
                            <th className="px-6 py-4 text-center">Ht</th>
                            <th className="px-6 py-4 text-center">Wt</th>
                            <th className="px-6 py-4 text-center">BMI</th>
                            <th className="px-6 py-4 text-center">BP</th>
                            <th className="px-6 py-4 text-center">Sugar</th>
                            <th className="px-6 py-4 text-center">Chol</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                        {sorted.map((p, i) => (
                            <tr key={i} className="border-b border-outline-variant/5 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                <td className="px-6 py-4 text-on-surface-variant text-xs font-mono border-r border-outline-variant/5">
                                    {new Date(p._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 font-extrabold text-blue-800 dark:text-blue-300 tracking-tight">{p.firstName} {p.surname}</td>
                                <td className="px-6 py-4 text-center capitalize text-xs font-bold text-on-surface-variant">{p.gender}</td>
                                <td className="px-6 py-4 text-center font-mono text-xs">{p.height || '--'}</td>
                                <td className="px-6 py-4 text-center font-mono text-xs">{p.weight || '--'}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.bmi >= 25 ? 'bg-error-container text-on-error-container ring-1 ring-error/20' : 'bg-green-100 text-green-700'}`}>
                                        {p.bmi || '--'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-mono text-xs font-bold">
                                    <span className={p.bpSystolic > 140 || p.bpDiastolic > 90 ? 'text-error font-extrabold' : 'text-on-surface'}>
                                        {p.bpSystolic}/{p.bpDiastolic}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-center font-bold ${p.bloodSugar > 140 ? 'text-error' : 'text-primary'}`}>
                                    {p.bloodSugar || '--'}
                                </td>
                                <td className={`px-6 py-4 text-center font-bold ${p.cholesterol > 200 ? 'text-error' : 'text-primary'}`}>
                                    {p.cholesterol || '--'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function HourlyVisitorChart({ filteredPatients }) {
    const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8am to 5pm
    const data = hours.map(hour => {
        const count = filteredPatients.filter(p => {
            const date = new Date(p._creationTime);
            return date.getHours() === hour;
        }).length;
        return { hour, count };
    });

    const maxCount = Math.max(...data.map(d => d.count), 5); // Default min scale focus

    return (
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm mt-8 animate-in zoom-in-95 duration-700">
            <h3 className="text-xl font-headline font-bold mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    Visitor Traffic Flow
                </div>
                <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full uppercase tracking-widest">8 AM — 5 PM</span>
            </h3>
            <div className="flex items-end justify-between h-48 gap-3 sm:gap-4 mb-4">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div className="relative w-full flex flex-col items-center justify-end h-full">
                            {/* Tooltip */}
                            <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-900 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 pointer-events-none z-10 shadow-xl after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-900">
                                {d.count} Patients
                            </div>
                            
                            {/* Count Label */}
                            {d.count > 0 && (
                                <div className="mb-2 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 opacity-90 animate-in fade-in zoom-in duration-500">
                                    {d.count}
                                </div>
                            )}
                            
                            {/* Bar */}
                            <div 
                                className="w-full max-w-[44px] bg-gradient-to-t from-primary/90 to-blue-400 rounded-t-md sm:rounded-t-lg transition-all duration-700 hover:brightness-110 cursor-pointer shadow-lg shadow-primary/5"
                                style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                            ></div>
                        </div>
                        {/* Label */}
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-4 tracking-tighter whitespace-nowrap opacity-60">
                            {d.hour > 12 ? `${d.hour-12} PM` : d.hour === 12 ? '12 PM' : `${d.hour} AM`}
                        </span>
                    </div>
                ))}
            </div>
            
            {/* Grid lines helper */}
            <div className="flex justify-between border-t border-outline-variant/10 mt-2 pt-2 text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
                <span>Peak Frequency Visualization</span>
                <span>Real-time tracking</span>
            </div>
        </div>
    );
}

function StatCard({title, value, icon, color, bg}) {
    return (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined ${color}`}>{icon}</span>
            </div>
            <div>
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{title}</h4>
                <p className="text-4xl font-headline font-extrabold">{value}</p>
            </div>
        </div>
    )
}
