import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, useNavigate, Link } from "react-router-dom";

export function Report() {
    const { id } = useParams();
    const patients = useQuery(api?.patients?.getPatients || "patients:getPatients") || [];
    const patient = patients.find(p => p._id === id);
    const navigate = useNavigate();
    const [generating, setGenerating] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const generateUploadUrl = useMutation(api.patients.generateUploadUrl);
    const saveReportId = useMutation(api.patients.saveReportId);
    
    // Get the report URL if it exists
    const reportUrl = useQuery(api.patients.getReportUrl, 
        patient.reportFileId ? { storageId: patient.reportFileId } : "skip"
    );

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        document.body.appendChild(script);
    }, []);

    if (!patient) return <div className="p-8 font-semibold text-slate-600 animate-pulse">Loading or compiling health data...</div>;

    const downloadPDF = async () => {
        if (!window.html2pdf) {
            alert("PDF library loading...");
            return;
        }
        setGenerating(true);
        const element = document.getElementById('pdf-content');
        const opt = {
            margin:       [0.3, 0.3, 0.5, 0.3],
            filename:     `Health_Report_${patient.firstName}_${patient.surname}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await window.html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = totalPages; i > 1; i--) {
                pdf.deletePage(i);
            }
        }).save();
        setGenerating(false);
    };

    const emailPDF = async () => {
        // First, trigger the download so the user has the file to attach
        await downloadPDF();
        
        const subject = `Clinical Health Report - ${patient.firstName} ${patient.surname}`;
        const body = `Hi ${patient.firstName},\n\nYour clinical health summary from the Heritage Health Fair is ready. \n\nIMPORTANT: I have automatically downloaded your report PDF to this device. Please ATTACH the file "Health_Report_${patient.firstName}_${patient.surname}.pdf" from your Downloads folder to this email before sending.\n\nBest regards,\nHeritage Health Fair Team`;
        
        window.location.href = `mailto:${patient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const generateQRShare = async () => {
        if (!window.html2pdf) {
            alert("PDF library loading...");
            return;
        }
        
        setGenerating(true);
        try {
            const element = document.getElementById('pdf-content');
            const opt = {
                margin:       [0.3, 0.3, 0.5, 0.3],
                filename:     `Health_Report_${patient.firstName}_${patient.surname}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
                pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Generate blob
            const pdfBlob = await window.html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
                const totalPages = pdf.internal.getNumberOfPages();
                for (let i = totalPages; i > 1; i--) {
                    pdf.deletePage(i);
                }
            }).output('blob');

            // Upload to Convex
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": "application/pdf" },
                body: pdfBlob,
            });
            const { storageId } = await result.json();

            // Save to patient
            await saveReportId({ patientId: patient._id, storageId });
            setShowQRModal(true);
        } catch (error) {
            console.error(error);
            alert("Failed to generate QR share link.");
        } finally {
            setGenerating(false);
        }
    };

    const isBPMHigh = patient.bpSystolic > 140 || patient.bpDiastolic > 90;
    const isBPMOpt = patient.bpSystolic <= 120 && patient.bpDiastolic <= 80;
    const bpPercent = Math.min(100, Math.max(0, ((patient.bpSystolic || 120) - 90) / Math.max(1, 180 - 90) * 100));

    const isSugarHigh = patient.bloodSugar > 140;
    const isCholesterolHigh = patient.cholesterol > 200;

    let riskLevel = "Low Risk";
    if (isBPMHigh || isSugarHigh || isCholesterolHigh) riskLevel = "Elevated";
    if (isBPMHigh && isSugarHigh) riskLevel = "High Risk";

    const bmiVal = patient.bmi ? parseFloat(patient.bmi) : NaN;
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

    return (
        <div className="bg-surface-container-low font-body text-on-surface antialiased flex flex-col items-center py-10 min-h-screen">
            <style>{`
                @media print {
                    body { background: white; }
                    .no-print { display: none; }
                    .print-container { width: 8.5in; height: 11in; padding: 0.5in; margin: 0; box-shadow: none; }
                }
                .clinical-gradient {
                    background: linear-gradient(135deg, #005bbf 0%, #1a73e8 100%);
                }
            `}</style>
            
            <header className="sticky top-0 z-50 flex items-center justify-between w-full px-8 py-4 max-w-[8.5in] mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm dark:shadow-none mb-6 rounded-xl">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Heritage Logo" className="h-10 w-auto object-contain" />
                    <span className="text-xl font-bold tracking-tight text-blue-800 dark:text-blue-200 font-headline">Heritage Health Fair</span>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-blue-700 dark:text-blue-400 font-semibold font-headline text-sm tracking-tight">&larr; Dashboard</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <button onClick={generateQRShare} disabled={generating} className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full transition-colors hover:bg-primary/20 active:scale-95 disabled:opacity-50">qr_code_2</button>
                    <button onClick={emailPDF} className="material-symbols-outlined text-slate-500 hover:bg-slate-50 p-2 rounded-full transition-colors hidden sm:block">share</button>
                    <button onClick={downloadPDF} disabled={generating} className="material-symbols-outlined text-white bg-primary p-2 rounded-full transition-colors active:scale-95 disabled:opacity-50 hover:brightness-110">download</button>
                </div>
            </header>

            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 no-print" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl">
                                <span className="material-symbols-outlined text-4xl text-primary">qr_code_2</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-headline font-bold text-on-surface">Scan to Download</h3>
                                <p className="text-sm text-on-surface-variant mt-2 font-medium">Scan this code with a mobile phone to download your Clinical Health Report.</p>
                            </div>
                            
                            {reportUrl ? (
                                <div className="bg-white p-4 rounded-2xl shadow-inner border border-outline-variant/10">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(reportUrl)}`} 
                                        alt="Report QR Code" 
                                        className="w-48 h-48"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-10">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Generating Link...</p>
                                </div>
                            )}

                            <button 
                                onClick={() => setShowQRModal(false)}
                                className="w-full py-3 bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-xl font-bold text-on-surface-variant text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main id="pdf-content" className="print-container w-full max-w-[8.5in] h-[10.2in] bg-surface-container-lowest shadow-2xl rounded-sm px-6 py-4 sm:px-8 sm:py-5 flex flex-col gap-5 relative overflow-hidden">
                <section className="flex justify-between items-start border-b border-outline-variant/20 pb-2">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="Heritage Logo" className="h-12 w-auto object-contain" />
                        <div className="space-y-0.5">
                            <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Clinical Health Summary</h1>
                            <p className="text-on-surface-variant font-medium tracking-wide text-xs">HEALTH FAIR | OFFICIAL CLINICAL RECORD</p>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Patient Name</span>
                            <span className="font-headline text-lg font-bold text-primary">{patient.firstName} {patient.surname}</span>
                        </div>
                        <div className="flex gap-4 text-xs justify-end">
                            <p><span className="text-on-surface-variant">DOB:</span> <span className="font-semibold capitalize">{patient.dob || 'Unknown'}</span></p>
                            <p><span className="text-on-surface-variant">Sex:</span> <span className="font-semibold capitalize">{patient.gender}</span></p>
                        </div>
                        <p className="text-[10px] font-mono bg-surface-container-high px-2 py-0.5 rounded w-max ml-auto">ID: #{patient._id.slice(-5).toUpperCase()}</p>
                        <p className="text-[10px] text-on-surface-variant">Visit Date: {new Date(patient._creationTime).toLocaleDateString()}</p>
                    </div>
                </section>

                <section className="space-y-2 mt-[-4px]">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                        <h2 className="font-headline font-bold text-lg">Overall Health Risk Profile</h2>
                    </div>
                    <div className="bg-surface-container-low px-5 py-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-end">
                            <div className="space-y-0.5">
                                <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider block leading-none">Current Status</span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${riskLevel === 'Low Risk' ? 'bg-secondary' : 'bg-error'}`}></span>
                                    <span className={`font-headline text-xl font-extrabold leading-none ${riskLevel === 'Low Risk' ? 'text-secondary' : 'text-error'}`}>{riskLevel}</span>
                                </div>
                            </div>
                            <span className="text-on-surface-variant text-[10px] italic hidden sm:block">Risk calculated based on present biomarkers</span>
                        </div>
                        <div className="relative pt-3">
                            <div className="h-3 w-full rounded-full bg-gradient-to-r from-secondary via-tertiary-fixed-dim to-error"></div>
                            <div className="absolute top-0 flex flex-col items-center -ml-3" style={{left: riskLevel === 'Low Risk' ? '15%' : riskLevel === 'Elevated' ? '50%' : '85%'}}>
                                <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>arrow_drop_down</span>
                                <div className="w-1 h-4 bg-primary rounded-full"></div>
                            </div>
                            <div className="flex justify-between mt-0.5 text-[9px] font-bold uppercase tracking-tighter text-on-surface-variant">
                                <span>Optimal</span>
                                <span>Moderate</span>
                                <span>Elevated</span>
                                <span>High Risk</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">monitor_heart</span>
                        <h2 className="font-headline font-bold text-lg">Vitals &amp; Measurements</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="bg-white border border-outline-variant/10 p-4 rounded-xl flex items-center justify-between">
                            <div className="w-[40%] sm:w-1/3">
                                <p className="text-xs font-semibold text-on-surface-variant">Blood Pressure</p>
                                <p className="text-xl sm:text-2xl font-headline font-extrabold">{patient.bpSystolic}/{patient.bpDiastolic} <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant block sm:inline">mmHg</span></p>
                            </div>
                            <div className="w-[55%] sm:w-2/3 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className={`uppercase ${isBPMOpt ? 'text-secondary' : isBPMHigh ? 'text-error' : 'text-tertiary-fixed-dim'}`}>{isBPMOpt ? 'Optimal' : isBPMHigh ? 'High' : 'Normal'}</span>
                                    <span className="text-on-surface-variant hidden sm:inline">Range: 90/60 - 120/80</span>
                                </div>
                                <div className="relative mt-1">
                                    <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 opacity-80"></div>
                                    <div className="absolute top-[-3px] w-1.5 h-3 bg-slate-800 rounded-sm shadow-sm" style={{left: `${Math.min(100, Math.max(0, (patient.bpSystolic / 200) * 100))}%`}}></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-on-surface-variant tracking-widest uppercase mt-0.5">
                                    <span>Optimal</span>
                                    <span>Borderline</span>
                                    <span>High</span>
                                </div>
                                <div className="flex justify-end hidden sm:block mt-1">
                                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-[9px] ${isBPMOpt ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>{isBPMOpt ? 'Normal Range' : 'Out of Range'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-outline-variant/10 p-4 rounded-xl flex items-center justify-between">
                            <div className="w-[40%] sm:w-1/3">
                                <p className="text-xs font-semibold text-on-surface-variant">Pulse Rate</p>
                                <p className="text-xl sm:text-2xl font-headline font-extrabold">{patient.pulse} <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant block sm:inline">BPM</span></p>
                            </div>
                            <div className="w-[55%] sm:w-2/3 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="uppercase text-secondary">{patient.pulse >= 60 && patient.pulse <= 100 ? 'Normal' : 'Abnormal'}</span>
                                    <span className="text-on-surface-variant hidden sm:inline">Range: 60 - 100</span>
                                </div>
                                <div className="relative mt-1">
                                    <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 opacity-80"></div>
                                    <div className="absolute top-[-3px] w-1.5 h-3 bg-slate-800 rounded-sm shadow-sm" style={{left: `${Math.min(100, Math.max(0, (patient.pulse / 150) * 100))}%`}}></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-on-surface-variant tracking-widest uppercase mt-0.5">
                                    <span>Low</span>
                                    <span>Normal</span>
                                    <span>High</span>
                                </div>
                                <div className="flex justify-end hidden sm:block mt-1">
                                    <span className="bg-secondary/10 text-secondary text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">In Range</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-outline-variant/10 p-4 rounded-xl flex items-center justify-between">
                            <div className="w-[40%] sm:w-1/3">
                                <p className="text-xs font-semibold text-on-surface-variant">Body Mass Index</p>
                                <p className="text-xl sm:text-2xl font-headline font-extrabold">{patient.bmi} <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant block sm:inline">kg/m2</span></p>
                            </div>
                            <div className="w-[55%] sm:w-2/3 space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-secondary uppercase">{patient.bmi < 18.5 ? 'Underweight' : patient.bmi < 25 ? 'Healthy' : 'Overweight'}</span>
                                    <span className="text-on-surface-variant hidden sm:inline">Range: 18.5 - 24.9</span>
                                </div>
                                <div className="relative mt-1">
                                    <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-surface-variant">
                                        <div className="h-full bg-blue-300 w-[20%]"></div>
                                        <div className="h-full bg-success w-[50%]"></div>
                                        <div className="h-full bg-orange-300 w-[15%]"></div>
                                        <div className="h-full bg-red-400 w-[15%]"></div>
                                    </div>
                                    {patient.bmi && <div className="absolute top-[-3px] w-1.5 h-3 bg-slate-800 rounded outline outline-1 outline-white shadow-sm" style={{left: bmiOffset}}></div>}
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-on-surface-variant tracking-widest uppercase mt-0.5">
                                    <span>Under</span>
                                    <span>Normal</span>
                                    <span>Over</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">biotech</span>
                        <h2 className="font-headline font-bold text-lg">Laboratory Results</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-surface-container-low p-5 rounded-2xl space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Blood Sugar</p>
                                    <h3 className="text-xl font-headline font-bold mt-0.5">{patient.bloodSugar} <span className="text-[10px] font-normal">mg/dL</span></h3>
                                </div>
                                <span className={`text-white text-[9px] px-2 py-0.5 rounded-full font-bold ${isSugarHigh ? 'bg-error' : 'bg-secondary'}`}>{isSugarHigh ? 'ELEVATED' : 'OPTIMAL'}</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 opacity-80"></div>
                                <div className="absolute top-[-5px] w-1 h-3.5 bg-slate-800 rounded-sm shadow-sm" style={{left: `${Math.min(100, Math.max(0, (patient.bloodSugar / 300) * 100))}%`}}></div>
                                <div className="flex justify-between text-[9px] font-bold text-on-surface-variant tracking-widest uppercase">
                                    <span>Optimal</span>
                                    <span>Elevated</span>
                                    <span>Critical</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-low p-5 rounded-2xl space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Cholesterol</p>
                                    <h3 className="text-xl font-headline font-bold mt-0.5">{patient.cholesterol} <span className="text-[10px] font-normal">mg/dL</span></h3>
                                </div>
                                <span className={`text-white text-[9px] px-2 py-0.5 rounded-full font-bold ${isCholesterolHigh ? 'bg-tertiary-container' : 'bg-secondary'}`}>{isCholesterolHigh ? 'HIGH RISK' : 'DESIRED'}</span>
                            </div>
                            <div className="space-y-1.5 relative">
                                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 opacity-80"></div>
                                <div className="absolute top-[-5px] w-1 h-3.5 bg-slate-800 rounded-sm shadow-sm" style={{left: `${Math.min(100, Math.max(0, (patient.cholesterol / 400) * 100))}%`}}></div>
                                <div className="flex justify-between text-[9px] font-bold text-on-surface-variant tracking-widest uppercase">
                                    <span>Desired</span>
                                    <span>Borderline</span>
                                    <span>High</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-4 pt-2 border-t border-outline-variant/10 flex flex-col gap-1">
                    <div className="flex gap-4 items-start opacity-70">
                        <span className="material-symbols-outlined text-primary-container text-sm mt-0.5">info</span>
                        <p className="text-[10px] leading-relaxed font-medium text-on-surface-variant">
                            This report is for informational purposes only. The results presented reflect a specific point in time and may be influenced by various physiological factors. Please consult with a healthcare professional for a complete diagnosis and medical advice.
                        </p>
                    </div>
                    <footer className="w-full flex justify-between items-center opacity-50 mt-1">
                        <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">© 2026 Heritage Health Fair | Clinical Report</p>
                        <div className="flex gap-4">
                            <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Privacy Policy</span>
                            <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Terms of Service</span>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}
