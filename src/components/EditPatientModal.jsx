import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function EditPatientModal({ patient, onClose }) {
    const updatePatient = useMutation(api.patients.updatePatient);
    
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            firstName: patient.firstName || "",
            surname: patient.surname || "",
            dob: patient.dob || "",
            gender: patient.gender || "male",
            phone: patient.phone || "",
            email: patient.email || "",
            height: patient.height || "",
            weight: patient.weight || "",
            bpSystolic: patient.bpSystolic || "",
            bpDiastolic: patient.bpDiastolic || "",
            pulse: patient.pulse || "",
            bloodSugar: patient.bloodSugar || "",
            cholesterol: patient.cholesterol || "",
        }
    });

    useEffect(() => {
        // Reset form values if the selected patient changes
        if (patient) {
            reset({
                ...patient,
                height: patient.height || "",
                weight: patient.weight || "",
                bpSystolic: patient.bpSystolic || "",
                bpDiastolic: patient.bpDiastolic || "",
                pulse: patient.pulse || "",
                bloodSugar: patient.bloodSugar || "",
                cholesterol: patient.cholesterol || ""
            });
        }
    }, [patient, reset]);

    const onSubmit = async (data) => {
        try {
            // Filter and cleanly parse numeric fields so we don't accidentally wipe out valid values with empty strings
            const updates = { 
                firstName: data.firstName,
                surname: data.surname,
                dob: data.dob,
                gender: data.gender,
                phone: data.phone,
                email: data.email,
            };

            const numericFields = ['height', 'weight', 'bpSystolic', 'bpDiastolic', 'pulse', 'bloodSugar', 'cholesterol'];
            numericFields.forEach(field => {
                if (data[field] !== "" && data[field] !== null && data[field] !== undefined) {
                    updates[field] = parseFloat(data[field]);
                }
            });

            // Recalculate BMI if height and weight are provided
            if (updates.height && updates.weight) {
                updates.bmi = parseFloat((updates.weight / Math.pow(updates.height / 100, 2)).toFixed(1));
            }

            // Remove any undefined or NaN properties entirely before sending to Convex
            Object.keys(updates).forEach(key => {
                if (updates[key] === undefined || Number.isNaN(updates[key])) {
                    delete updates[key];
                }
            });

            await updatePatient({ id: patient._id, updates });
            onClose();
        } catch(e) {
            console.error(e);
            alert("Failed to update patient data. Connect to Convex Backend.");
        }
    };

    if (!patient) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 border-b border-outline-variant/20 flex justify-between items-center z-10 rounded-t-3xl">
                    <div>
                        <h2 className="text-2xl font-headline font-bold text-on-surface">Edit Patient Record</h2>
                        <p className="text-sm text-on-surface-variant font-medium">ID: #{patient._id.slice(-5).toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                    {/* Demographics Segment */}
                    <section>
                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">person</span> Demographics</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">First Name</label>
                                <input {...register("firstName")} required className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Surname</label>
                                <input {...register("surname")} required className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">DoB</label>
                                <input type="date" {...register("dob")} required className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gender</label>
                                <select {...register("gender")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium">
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone</label>
                                <input {...register("phone")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
                                <input {...register("email")} type="email" className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                        </div>
                    </section>

                    {/* Clinical Segment */}
                    <section>
                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">monitor_heart</span> Clinical Data</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Height (cm)</label>
                                <input type="number" step="0.1" {...register("height")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Weight (kg)</label>
                                <input type="number" step="0.1" {...register("weight")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pulse (bpm)</label>
                                <input type="number" {...register("pulse")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">BP Systolic</label>
                                <input type="number" {...register("bpSystolic")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">BP Diastolic</label>
                                <input type="number" {...register("bpDiastolic")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Blood Sugar</label>
                                <input type="number" step="0.1" {...register("bloodSugar")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cholesterol</label>
                                <input type="number" step="0.1" {...register("cholesterol")} className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm font-medium" />
                            </div>
                        </div>
                    </section>
                    
                    <div className="pt-6 border-t border-outline-variant/20 flex gap-4 justify-end pb-2">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-variant transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
