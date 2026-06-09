import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";

export function Registration() {
    const addPatient   = useMutation(api?.patients?.addPatient || "patients:addPatient");
    const participants = useQuery(api.patients.getParticipants) || [];
    const navigate     = useNavigate();
    const { register, handleSubmit, setValue, reset } = useForm();

    const [search, setSearch]     = useState("");
    const [showDrop, setShowDrop] = useState(false);
    const [selected, setSelected] = useState(null);
    const searchRef               = useRef(null);

    // Live-filter participants by name
    const q = search.trim().toLowerCase();
    const matches = q.length >= 2
        ? participants.filter(p =>
            `${p.firstName} ${p.surname}`.toLowerCase().includes(q) ||
            `${p.surname} ${p.firstName}`.toLowerCase().includes(q)
          )
        : [];

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (p) => {
        setSelected(p);
        setSearch(`${p.firstName} ${p.surname}`);
        setShowDrop(false);
        setValue("firstName",    p.firstName    || "");
        setValue("surname",      p.surname      || "");
        setValue("dob",          p.dob          || "");
        setValue("gender",       (p.gender      || "").toLowerCase());
        setValue("email",        p.email        || "");
        setValue("businessUnit", p.businessUnit || "");
    };

    const handleClear = () => {
        setSelected(null);
        setSearch("");
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (api?.patients?.addPatient) {
                await addPatient(data);
                navigate("/");
            }
        } catch(e) {
            console.error(e);
            alert("Ensure 'npx convex dev' is running.");
        }
    };

    return (
        <div className="text-on-surface bg-surface min-h-screen flex flex-col font-sans">
            <header className="fixed top-0 w-full z-50 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between px-6 py-3 w-full">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Heritage Logo" className="h-8 w-auto object-contain" />
                        <h1 className="font-headline font-bold text-lg tracking-tight text-blue-800 dark:text-blue-300 tracking-tighter">Heritage Health Fair</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-1 rounded-lg">Visitors</Link>
                        <a className="text-blue-700 dark:text-blue-400 font-bold underline underline-offset-4" href="#">Current Station</a>
                    </nav>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 h-px w-full"></div>
            </header>
            
            <main className="flex-grow pt-24 pb-32 px-4 md:px-8 max-w-3xl mx-auto w-full">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Station 01</span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-container text-success text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                            System Online
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Registration Station</h2>
                    <p className="text-on-surface-variant leading-relaxed">Initialize the visitor journey by capturing essential demographic and contact information.</p>
                </div>

                {/* Participant lookup */}
                <div ref={searchRef} className="mb-6 relative">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">manage_search</span>
                        Search Participant Registry
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setShowDrop(true); setSelected(null); }}
                            onFocus={() => q.length >= 2 && setShowDrop(true)}
                            placeholder="Type a name to find a pre-registered participant..."
                            className="w-full h-12 pl-10 pr-10 rounded-xl border-2 border-outline-variant bg-white focus:border-primary focus:ring-0 outline-none transition-all text-sm font-medium shadow-sm"
                        />
                        {search && (
                            <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        )}
                    </div>

                    {/* Dropdown results */}
                    {showDrop && matches.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-outline-variant/30 shadow-xl overflow-hidden">
                            <div className="px-4 py-2 border-b border-outline-variant/10 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[16px]">group</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{matches.length} participant{matches.length !== 1 ? 's' : ''} found</span>
                            </div>
                            {matches.map((p, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelect(p)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors border-b border-outline-variant/5 last:border-0 text-left"
                                >
                                    <div>
                                        <p className="font-bold text-sm text-on-surface">{p.firstName} {p.surname}</p>
                                        <p className="text-xs text-on-surface-variant mt-0.5">
                                            {p.businessUnit && <span className="font-semibold text-primary">{p.businessUnit}</span>}
                                            {p.businessUnit && (p.dob || p.gender) ? ' · ' : ''}
                                            {p.dob ? `DOB: ${p.dob}` : ''}
                                            {p.dob && p.gender ? ' · ' : ''}
                                            {p.gender || ''}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary/50 text-[18px]">arrow_forward</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results hint */}
                    {showDrop && q.length >= 2 && matches.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-outline-variant/30 shadow-xl px-4 py-4 text-sm text-on-surface-variant text-center">
                            No participants found for "<span className="font-semibold">{search}</span>" — fill in manually below.
                        </div>
                    )}
                </div>

                {/* Selected participant banner */}
                {selected && (
                    <div className="mb-6 flex items-center gap-3 bg-primary/[0.08] border border-primary/20 px-4 py-3 rounded-xl">
                        <span className="material-symbols-outlined text-primary text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-on-surface">Fields pre-filled from participant registry</p>
                            <p className="text-xs text-on-surface-variant">You can still edit any field before registering.</p>
                        </div>
                        <button type="button" onClick={handleClear} className="text-xs font-bold text-primary hover:underline">Clear</button>
                    </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-outline-variant/30 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-surface-variant pb-4">
                            <span className="material-symbols-outlined text-primary">person</span>
                            <h3 className="font-bold text-lg">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-on-surface-variant">First Name</label>
                                <input {...register("firstName")} required className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="John" type="text"/>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-on-surface-variant">Surname</label>
                                <input {...register("surname")} required className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Doe" type="text"/>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-on-surface-variant">Date of Birth</label>
                                <input {...register("dob")} required className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" type="date"/>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-on-surface-variant">Gender</label>
                                <div className="flex gap-4 h-11 items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input {...register("gender")} className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" type="radio" value="male"/>
                                        <span className="text-sm font-medium">Male</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input {...register("gender")} className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" type="radio" value="female"/>
                                        <span className="text-sm font-medium">Female</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input {...register("gender")} className="w-4 h-4 text-primary focus:ring-primary border-outline-variant" type="radio" value="other"/>
                                        <span className="text-sm font-medium">Other</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border border-outline-variant/30 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-surface-variant pb-4">
                            <span className="material-symbols-outlined text-primary">contact_page</span>
                            <h3 className="font-bold text-lg">Contact Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-on-surface-variant">Phone Number</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">call</span>
                                    <input {...register("phone")} className="w-full h-11 pl-10 pr-4 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="(555) 000-0000" type="tel"/>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-on-surface-variant">Email Address</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">mail</span>
                                    <input {...register("email")} className="w-full h-11 pl-10 pr-4 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="john.doe@example.com" type="email"/>
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-on-surface-variant">Business Unit</label>
                                <input {...register("businessUnit")} className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Finance, HR, Operations" type="text"/>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <button className="w-full h-14 bg-primary text-white font-bold text-lg rounded-lg shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3" type="submit">
                            <span className="material-symbols-outlined">person_add</span> Register Visitor
                        </button>
                    </div>
                </form>

                <div className="mt-12 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-secondary/70 mb-4 px-1">Registration Benefits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white rounded-lg border border-outline-variant/20 flex flex-col gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">security</span>
                            </div>
                            <div>
                                <h5 className="font-bold text-sm">Data Privacy</h5>
                                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Encrypted HIPAA-compliant storage.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-outline-variant/20 flex flex-col gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">qr_code</span>
                            </div>
                            <div>
                                <h5 className="font-bold text-sm">Instant Access</h5>
                                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Digital ID sent via email immediately.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-outline-variant/20 flex flex-col gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-lg">speed</span>
                            </div>
                            <div>
                                <h5 className="font-bold text-sm">Fast Track</h5>
                                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Skip lines at medical stations.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
