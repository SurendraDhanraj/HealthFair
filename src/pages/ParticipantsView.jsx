import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    // Detect header — look for "surname" or "firstname" (case-insensitive)
    const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const surnameIdx   = header.findIndex(h => h.includes('surname'));
    const firstNameIdx = header.findIndex(h => h.includes('first') || h === 'firstname' || h === 'name');
    const buIdx        = header.findIndex(h => h.includes('business') || h.includes('unit') || h.includes('dept'));
    const genderIdx    = header.findIndex(h => h.includes('gender') || h.includes('sex'));
    const dobIdx       = header.findIndex(h => h.includes('dob') || h.includes('birth'));
    const emailIdx     = header.findIndex(h => h.includes('email'));

    if (surnameIdx === -1 || firstNameIdx === -1) return null; // bad header

    return lines.slice(1).filter(l => l.trim()).map(line => {
        // Handle quoted fields with commas inside
        const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(c => c.trim().replace(/^"|"$/g, '')) || line.split(',').map(c => c.trim());
        return {
            surname:      cols[surnameIdx]   || '',
            firstName:    cols[firstNameIdx] || '',
            businessUnit: buIdx >= 0        ? (cols[buIdx]     || '') : undefined,
            gender:       genderIdx >= 0    ? (cols[genderIdx] || '') : undefined,
            dob:          dobIdx >= 0       ? (cols[dobIdx]    || '') : undefined,
            email:        emailIdx >= 0     ? (cols[emailIdx]  || '') : undefined,
        };
    }).filter(p => p.surname || p.firstName);
}

export function ParticipantsView() {
    const participants  = useQuery(api.patients.getParticipants) || [];
    const bulkAdd       = useMutation(api.patients.bulkAddParticipants);
    const clearAll      = useMutation(api.patients.clearParticipants);

    const [preview, setPreview]       = useState(null);   // parsed rows awaiting confirm
    const [parseError, setParseError] = useState('');
    const [fileName, setFileName]     = useState('');
    const [importing, setImporting]   = useState(false);
    const [clearing, setClearing]     = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [showConfirmClear, setShowConfirmClear] = useState(false);
    const fileRef = useRef();

    const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };

    const handleFile = (file) => {
        if (!file) return;
        setParseError('');
        setPreview(null);
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = parseCSV(e.target.result);
            if (result === null) {
                setParseError('Could not detect Surname and Firstname columns. Please check the CSV header row.');
            } else if (result.length === 0) {
                setParseError('The file appears to be empty or contains no valid rows.');
            } else {
                setPreview(result);
            }
        };
        reader.readAsText(file);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file?.name.endsWith('.csv')) handleFile(file);
        else setParseError('Please drop a .csv file.');
    }, []);

    const handleImport = async () => {
        if (!preview?.length) return;
        setImporting(true);
        try {
            await clearAll();
            await bulkAdd({ participants: preview });
            flash(`✓ ${preview.length} participants imported successfully.`);
            setPreview(null);
            setFileName('');
        } catch(e) {
            setParseError('Import failed: ' + e.message);
        } finally {
            setImporting(false);
        }
    };

    const handleClear = async () => {
        setClearing(true);
        try {
            const count = await clearAll();
            flash(`✓ ${count} participants cleared.`);
            setShowConfirmClear(false);
        } catch(e) {
            setParseError('Clear failed: ' + e.message);
        } finally {
            setClearing(false);
        }
    };

    // Group by business unit for stats
    const byUnit = participants.reduce((acc, p) => {
        const unit = p.businessUnit || 'Unassigned';
        acc[unit] = (acc[unit] || 0) + 1;
        return acc;
    }, {});

    const displayRows = preview || participants;
    const isPreviewMode = !!preview;

    return (
        <>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Participant Registry</h2>
                    <p className="text-on-surface-variant font-body mt-2">
                        {participants.length > 0
                            ? <><span className="font-bold text-on-surface">{participants.length}</span> pre-registered participants across <span className="font-bold text-on-surface">{Object.keys(byUnit).length}</span> business units</>
                            : 'Upload a CSV to pre-load your attendee list'}
                    </p>
                </div>
                {participants.length > 0 && !isPreviewMode && (
                    <button
                        onClick={() => setShowConfirmClear(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-error/30 text-error font-bold text-sm hover:bg-error/10 transition-colors self-start md:self-auto"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                        Clear List
                    </button>
                )}
            </div>

            {/* Success banner */}
            {successMsg && (
                <div className="mb-6 flex items-center gap-3 bg-secondary/10 border border-secondary/20 text-secondary font-bold text-sm px-5 py-3.5 rounded-2xl">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    {successMsg}
                </div>
            )}

            {/* Upload area */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !isPreviewMode && fileRef.current?.click()}
                className={`mb-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer
                    ${isPreviewMode
                        ? 'border-primary/40 bg-primary/5 cursor-default'
                        : isDragging
                            ? 'border-primary bg-primary/10 scale-[1.01]'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50 hover:bg-primary/5'
                    } p-10 flex flex-col items-center justify-center text-center`}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={e => handleFile(e.target.files?.[0])}
                />
                {isPreviewMode ? (
                    <>
                        <span className="material-symbols-outlined text-5xl text-primary mb-3" style={{fontVariationSettings: "'wght' 200"}}>task</span>
                        <p className="font-bold text-on-surface text-lg">{fileName}</p>
                        <p className="text-sm text-on-surface-variant mt-1">{preview.length} rows ready to import — review below then click <strong>Confirm Import</strong></p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setPreview(null); setFileName(''); }}
                            className="mt-4 text-sm text-on-surface-variant hover:text-error transition-colors font-semibold"
                        >
                            ✕ Discard and choose another file
                        </button>
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3" style={{fontVariationSettings: "'wght' 200"}}>upload_file</span>
                        <p className="font-bold text-on-surface">Drop your CSV here or click to browse</p>
                        <p className="text-sm text-on-surface-variant mt-2 max-w-sm">
                            Expected columns: <span className="font-mono text-xs bg-surface-container px-1.5 py-0.5 rounded">Surname, Firstname, Business Unit, Gender, DOB, Email</span>
                        </p>
                        <p className="text-xs text-on-surface-variant/60 mt-2">Uploading a new file will replace the current list</p>
                    </>
                )}
            </div>

            {parseError && (
                <div className="mb-6 flex items-center gap-3 bg-error/10 border border-error/20 text-error font-semibold text-sm px-5 py-3.5 rounded-2xl">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    {parseError}
                </div>
            )}

            {/* Import confirm bar */}
            {isPreviewMode && (
                <div className="mb-6 flex items-center justify-between gap-4 bg-primary/8 border border-primary/20 px-5 py-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">info</span>
                        <p className="text-sm font-semibold text-on-surface">
                            This will <strong>replace</strong> the existing list with {preview.length} new participants.
                        </p>
                    </div>
                    <button
                        onClick={handleImport}
                        disabled={importing}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-[18px]">{importing ? 'hourglass_top' : 'upload'}</span>
                        {importing ? 'Importing...' : 'Confirm Import'}
                    </button>
                </div>
            )}

            {/* Business unit summary chips */}
            {!isPreviewMode && Object.keys(byUnit).length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {Object.entries(byUnit).sort((a,b) => b[1]-a[1]).map(([unit, count]) => (
                        <span key={unit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold border border-outline-variant/20">
                            <span className="material-symbols-outlined text-[14px] text-primary">corporate_fare</span>
                            {unit} <span className="text-primary">({count})</span>
                        </span>
                    ))}
                </div>
            )}

            {/* Table */}
            {displayRows.length > 0 && (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/10">
                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                            {isPreviewMode ? `Preview — ${preview.length} rows` : `Loaded — ${participants.length} participants`}
                        </span>
                        {isPreviewMode && <span className="text-xs font-semibold text-primary">Not yet saved</span>}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3 font-bold">Surname</th>
                                    <th className="text-left px-5 py-3 font-bold">First Name</th>
                                    <th className="text-left px-5 py-3 font-bold">Business Unit</th>
                                    <th className="text-left px-5 py-3 font-bold">Gender</th>
                                    <th className="text-left px-5 py-3 font-bold">DOB</th>
                                    <th className="text-left px-5 py-3 font-bold">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayRows.map((p, i) => (
                                    <tr key={i} className="border-t border-outline-variant/5 hover:bg-surface-container/50 transition-colors">
                                        <td className="px-5 py-3 font-semibold text-on-surface">{p.surname}</td>
                                        <td className="px-5 py-3 text-on-surface">{p.firstName}</td>
                                        <td className="px-5 py-3">
                                            {p.businessUnit ? (
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{p.businessUnit}</span>
                                            ) : <span className="text-on-surface-variant/40">—</span>}
                                        </td>
                                        <td className="px-5 py-3 text-on-surface-variant">{p.gender || '—'}</td>
                                        <td className="px-5 py-3 text-on-surface-variant">{p.dob || '—'}</td>
                                        <td className="px-5 py-3 text-on-surface-variant text-xs">{p.email || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirm clear modal */}
            {showConfirmClear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4">
                        <span className="material-symbols-outlined text-error text-4xl mb-4 block" style={{fontVariationSettings: "'wght' 200"}}>warning</span>
                        <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Clear all participants?</h3>
                        <p className="text-sm text-on-surface-variant mb-6">This will remove all {participants.length} participants from the registry. This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 font-bold text-sm text-on-surface hover:bg-surface-container transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleClear} disabled={clearing} className="flex-1 py-3 rounded-xl bg-error text-on-error font-bold text-sm hover:brightness-110 disabled:opacity-60 transition-all">
                                {clearing ? 'Clearing...' : 'Yes, Clear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
