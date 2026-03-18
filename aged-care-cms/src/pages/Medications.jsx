import { useState, useMemo } from 'react';
import {
  Pill, Plus, Search, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import {
  getResidents, getMedications, addMedication, deleteMedication, updateMedication,
  getMARRecords, recordMAR
} from '../store';

const ROUTES = ['Oral', 'Topical', 'Sublingual', 'Inhaled', 'Transdermal', 'SC injection', 'IM injection', 'IV', 'Eye drops', 'Ear drops', 'Rectal', 'Other'];
const FREQS = ['OD', 'BD', 'TDS', 'QDS', 'PRN', 'Weekly', 'Fortnightly', 'Monthly', 'Nocte', 'Mane'];
const TIMES_FOR_FREQ = { OD: ['08:00'], BD: ['08:00', '18:00'], TDS: ['08:00', '13:00', '18:00'], QDS: ['08:00', '12:00', '16:00', '20:00'], Nocte: ['21:00'], Mane: ['08:00'] };

const MAR_STATUS = {
  given: { label: 'Given', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  refused: { label: 'Refused', color: 'bg-red-100 text-red-700', icon: XCircle },
  held: { label: 'Held', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  na: { label: 'N/A', color: 'bg-slate-100 text-slate-500', icon: null },
};

function MARCell({ med, residentId, date, time }) {
  const records = getMARRecords(residentId, date);
  const record = records.find(r => r.medicationId === med.id && r.scheduledTime === time);
  const status = record?.status || null;

  function cycle() {
    const order = [null, 'given', 'refused', 'held'];
    const next = order[(order.indexOf(status) + 1) % order.length];
    if (next === null) {
      // clear — store as null by just recording again
      recordMAR({ medicationId: med.id, residentId, date, scheduledTime: time, status: null });
    } else {
      recordMAR({ medicationId: med.id, residentId, date, scheduledTime: time, status: next });
    }
    // Force re-render hack via key change — parent will refresh
    window.dispatchEvent(new Event('mar-updated'));
  }

  const cfg = status ? MAR_STATUS[status] : null;

  return (
    <button
      onClick={cycle}
      title={`${med.name} ${time} – click to cycle status`}
      className={`w-20 h-8 rounded text-xs font-medium border transition-colors ${cfg ? cfg.color + ' border-transparent' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
    >
      {cfg ? cfg.label : time}
    </button>
  );
}

function MedForm({ residents, onSave, onClose }) {
  const [form, setForm] = useState({
    residentId: residents[0]?.id || '',
    name: '', dose: '', route: 'Oral', frequency: 'OD',
    times: ['08:00'], indication: '', prescriber: '',
    startDate: new Date().toISOString().split('T')[0], active: true,
  });

  function set(field, val) {
    setForm(f => {
      const next = { ...f, [field]: val };
      if (field === 'frequency') {
        next.times = TIMES_FOR_FREQ[val] || ['08:00'];
      }
      return next;
    });
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Add Medication</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-3">
          <div>
            <label className={labelCls}>Resident *</label>
            <select required value={form.residentId} onChange={e => set('residentId', e.target.value)} className={inputCls}>
              {residents.map(r => <option key={r.id} value={r.id}>{r.firstName} {r.lastName} – Room {r.roomNumber}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Medication Name *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Dose *</label>
              <input required value={form.dose} onChange={e => set('dose', e.target.value)} placeholder="e.g. 500mg" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Route</label>
              <select value={form.route} onChange={e => set('route', e.target.value)} className={inputCls}>
                {ROUTES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Frequency</label>
              <select value={form.frequency} onChange={e => set('frequency', e.target.value)} className={inputCls}>
                {FREQS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Scheduled Times (comma-separated)</label>
            <input value={form.times.join(', ')} onChange={e => set('times', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Indication</label>
              <input value={form.indication} onChange={e => set('indication', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Prescriber</label>
              <input value={form.prescriber} onChange={e => set('prescriber', e.target.value)} placeholder="Dr. " className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Start Date</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Add Medication</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Medications() {
  const residents = getResidents();
  const [selectedResident, setSelectedResident] = useState(residents[0]?.id || '');
  const [tab, setTab] = useState('list'); // 'list' | 'mar'
  const [showForm, setShowForm] = useState(false);
  const [meds, setMeds] = useState(() => getMedications());
  const [marTick, setMarTick] = useState(0);

  // listen for MAR updates
  useMemo(() => {
    const handler = () => setMarTick(t => t + 1);
    window.addEventListener('mar-updated', handler);
    return () => window.removeEventListener('mar-updated', handler);
  }, []);

  const resident = residents.find(r => r.id === selectedResident);
  const resMeds = meds.filter(m => m.residentId === selectedResident);
  const marDate = new Date().toISOString().split('T')[0];

  function handleAdd(data) {
    addMedication(data);
    setMeds(getMedications());
    setShowForm(false);
  }

  function handleDelete(id) {
    if (confirm('Remove this medication?')) {
      deleteMedication(id);
      setMeds(getMedications());
    }
  }

  function toggleActive(id, current) {
    updateMedication(id, { active: !current });
    setMeds(getMedications());
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medications</h1>
          <p className="text-slate-500 text-sm">Medication chart &amp; administration records</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      </div>

      {/* Resident selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <label className="text-xs font-medium text-slate-500 block mb-2">Select Resident</label>
        <div className="flex flex-wrap gap-2">
          {residents.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedResident(r.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                selectedResident === r.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r.firstName} {r.lastName}
            </button>
          ))}
        </div>
      </div>

      {resident && (
        <>
          {/* Allergy warning */}
          {resident.allergies && resident.allergies.toLowerCase() !== 'none known' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <strong>Allergies:</strong>&nbsp;{resident.allergies}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-slate-200 flex gap-1">
            {['list', 'mar'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize
                  ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'mar' ? 'MAR (Today)' : 'Medication List'}
              </button>
            ))}
          </div>

          {/* Medication list */}
          {tab === 'list' && (
            <div className="space-y-3">
              {resMeds.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Pill className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No medications for this resident.</p>
                </div>
              ) : (
                resMeds.map(med => (
                  <div key={med.id} className={`bg-white border rounded-xl p-4 ${!med.active ? 'opacity-60' : 'border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {med.name} <span className="text-slate-500 font-normal text-sm">{med.dose}</span>
                        </div>
                        <div className="text-sm text-slate-500 mt-0.5">
                          {med.route} &middot; {med.frequency} &middot; {Array.isArray(med.times) ? med.times.join(', ') : med.times}
                        </div>
                        {med.indication && <div className="text-xs text-slate-400 mt-1">For: {med.indication}</div>}
                        {med.prescriber && <div className="text-xs text-slate-400">Prescriber: {med.prescriber}</div>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleActive(med.id, med.active)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer ${med.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {med.active ? 'Active' : 'Ceased'}
                        </button>
                        <button onClick={() => handleDelete(med.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MAR */}
          {tab === 'mar' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800">Medication Administration Record</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} &middot; Click a cell to cycle: — → Given → Refused → Held
                </p>
              </div>
              {resMeds.filter(m => m.active).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No active medications to administer.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                        <th className="text-left px-4 py-3 font-medium">Medication</th>
                        <th className="text-left px-4 py-3 font-medium">Dose / Route</th>
                        <th className="px-4 py-3 font-medium" colSpan={5}>Scheduled Times</th>
                      </tr>
                    </thead>
                    <tbody key={marTick}>
                      {resMeds.filter(m => m.active).map(med => (
                        <tr key={med.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-800">{med.name}</td>
                          <td className="px-4 py-3 text-slate-500">{med.dose} {med.route}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {(Array.isArray(med.times) ? med.times : [med.times]).map(t => (
                                <MARCell key={t} med={med} residentId={resident.id} date={marDate} time={t} />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="p-4 border-t border-slate-100 flex gap-4 text-xs text-slate-400">
                {Object.entries(MAR_STATUS).filter(([k]) => k !== 'na').map(([k, v]) => (
                  <span key={k} className={`px-2 py-0.5 rounded font-medium ${v.color}`}>{v.label}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showForm && <MedForm residents={residents} onSave={handleAdd} onClose={() => setShowForm(false)} />}
    </div>
  );
}
