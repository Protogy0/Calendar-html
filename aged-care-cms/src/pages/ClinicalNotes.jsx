import { useState, useEffect } from 'react';
import { Plus, Trash2, Activity, FileText, Search } from 'lucide-react';
import { getResidents, getNotes, addNote, deleteNote, getVitals, addVitals } from '../store';

const NOTE_TYPES = ['Progress', 'Wound', 'Incident', 'Behaviour', 'Nutrition', 'Continence', 'Other'];

function NoteForm({ residents, onSave, onClose }) {
  const [form, setForm] = useState({
    residentId: residents[0]?.id || '',
    type: 'Progress', content: '', author: '',
  });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Add Clinical Note</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-3">
          <div>
            <label className={labelCls}>Resident *</label>
            <select required value={form.residentId} onChange={e => set('residentId', e.target.value)} className={inputCls}>
              {residents.map(r => <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Note Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                {NOTE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Author / Staff Name</label>
              <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="RN Jane Smith" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Note Content *</label>
            <textarea required rows={5} value={form.content} onChange={e => set('content', e.target.value)} className={inputCls + ' resize-none'} placeholder="Describe observations, interventions, resident response..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Note</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VitalsForm({ residents, onSave, onClose }) {
  const [form, setForm] = useState({
    residentId: residents[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    bp: '', pulse: '', temp: '', spo2: '', rr: '', bsl: '', weight: '', notes: '', author: '',
  });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Record Vitals</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-3">
          <div>
            <label className={labelCls}>Resident *</label>
            <select required value={form.residentId} onChange={e => set('residentId', e.target.value)} className={inputCls}>
              {residents.map(r => <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Blood Pressure (mmHg)</label>
              <input value={form.bp} onChange={e => set('bp', e.target.value)} placeholder="e.g. 130/80" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pulse (bpm)</label>
              <input value={form.pulse} onChange={e => set('pulse', e.target.value)} placeholder="e.g. 72" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Temperature (°C)</label>
              <input value={form.temp} onChange={e => set('temp', e.target.value)} placeholder="e.g. 36.8" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>SpO₂ (%)</label>
              <input value={form.spo2} onChange={e => set('spo2', e.target.value)} placeholder="e.g. 98" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Resp Rate (/min)</label>
              <input value={form.rr} onChange={e => set('rr', e.target.value)} placeholder="e.g. 18" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>BSL (mmol/L)</label>
              <input value={form.bsl} onChange={e => set('bsl', e.target.value)} placeholder="e.g. 6.2" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Weight (kg)</label>
              <input value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 68.5" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Staff Name</label>
              <input value={form.author} onChange={e => set('author', e.target.value)} placeholder="RN Jane Smith" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} className={inputCls + ' resize-none'} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Vitals</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const noteTypeColor = {
  Progress: 'bg-blue-100 text-blue-700',
  Wound: 'bg-red-100 text-red-700',
  Incident: 'bg-orange-100 text-orange-700',
  Behaviour: 'bg-purple-100 text-purple-700',
  Nutrition: 'bg-yellow-100 text-yellow-700',
  Continence: 'bg-teal-100 text-teal-700',
  Other: 'bg-slate-100 text-slate-600',
};

export default function ClinicalNotes() {
  const [residents, setResidents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('notes');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [filterResident, setFilterResident] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getResidents(), getNotes(), getVitals()])
      .then(([r, n, v]) => {
        setResidents(r);
        setNotes(n);
        setVitals(v);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filteredNotes = notes.filter(n =>
    (!filterResident || n.residentId === filterResident) &&
    (!filterType || n.type === filterType) &&
    (!search || n.content.toLowerCase().includes(search.toLowerCase()) || (n.author || '').toLowerCase().includes(search.toLowerCase()))
  );

  const filteredVitals = vitals.filter(v => !filterResident || v.residentId === filterResident);

  async function handleAddNote(data) {
    await addNote(data);
    const updated = await getNotes();
    setNotes(updated);
    setShowNoteForm(false);
  }

  async function handleAddVitals(data) {
    await addVitals(data);
    const updated = await getVitals();
    setVitals(updated);
    setShowVitalsForm(false);
  }

  async function handleDeleteNote(id) {
    if (confirm('Delete this note?')) {
      await deleteNote(id);
      const updated = await getNotes();
      setNotes(updated);
    }
  }

  function residentName(id) {
    const r = residents.find(r => r.id === id);
    return r ? `${r.firstName} ${r.lastName}` : 'Unknown';
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading…</div>;
  if (error) return <div className="text-red-600 p-4 text-sm">Error: {error}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clinical Notes</h1>
          <p className="text-slate-500 text-sm">Progress notes, incidents, vitals &amp; assessments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowVitalsForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 font-medium"
          >
            <Activity className="w-4 h-4" /> Record Vitals
          </button>
          <button
            onClick={() => setShowNoteForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Add Note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3">
        <select
          value={filterResident}
          onChange={e => setFilterResident(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Residents</option>
          {residents.map(r => <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>)}
        </select>

        {tab === 'notes' && (
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {NOTE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        )}

        {tab === 'notes' && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-1">
        {['notes', 'vitals'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize
              ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t === 'notes' ? `Clinical Notes (${filteredNotes.length})` : `Vitals (${filteredVitals.length})`}
          </button>
        ))}
      </div>

      {/* Notes list */}
      {tab === 'notes' && (
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No notes found.</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-medium text-slate-800">{residentName(note.residentId)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${noteTypeColor[note.type] || noteTypeColor.Other}`}>
                        {note.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(note.createdAt).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {note.author && <span className="text-xs text-slate-400 ml-auto">{note.author}</span>}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{note.content}</p>
                  </div>
                  <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 text-slate-300 hover:text-red-500 rounded flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vitals list */}
      {tab === 'vitals' && (
        <div className="space-y-3">
          {filteredVitals.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No vitals recorded.</p>
            </div>
          ) : (
            filteredVitals.map(v => (
              <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-slate-800">{residentName(v.residentId)}</span>
                  <div className="text-xs text-slate-400">
                    {v.date} {v.time && `at ${v.time}`}
                    {v.author && ` · ${v.author}`}
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {v.bp && <VitalChip label="BP" value={v.bp} unit="mmHg" />}
                  {v.pulse && <VitalChip label="Pulse" value={v.pulse} unit="bpm" />}
                  {v.temp && <VitalChip label="Temp" value={v.temp} unit="°C" />}
                  {v.spo2 && <VitalChip label="SpO₂" value={v.spo2} unit="%" />}
                  {v.rr && <VitalChip label="RR" value={v.rr} unit="/min" />}
                  {v.bsl && <VitalChip label="BSL" value={v.bsl} unit="mmol/L" />}
                  {v.weight && <VitalChip label="Weight" value={v.weight} unit="kg" />}
                </div>
                {v.notes && <p className="text-xs text-slate-500 mt-2 italic">{v.notes}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {showNoteForm && <NoteForm residents={residents} onSave={handleAddNote} onClose={() => setShowNoteForm(false)} />}
      {showVitalsForm && <VitalsForm residents={residents} onSave={handleAddVitals} onClose={() => setShowVitalsForm(false)} />}
    </div>
  );
}

function VitalChip({ label, value, unit }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-semibold text-slate-800 text-sm">{value}</div>
      <div className="text-xs text-slate-400">{unit}</div>
    </div>
  );
}
