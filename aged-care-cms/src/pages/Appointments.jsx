import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, X, CalendarDays, MapPin, User, FileText, Trash2 } from 'lucide-react';
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, getResidents } from '../store';

const TYPES = ['GP', 'Specialist', 'Allied Health', 'Pathology', 'Radiology', 'Dental', 'Other'];

const typeColors = {
  GP: '#2563eb',
  Specialist: '#7c3aed',
  'Allied Health': '#16a34a',
  Pathology: '#dc2626',
  Radiology: '#ea580c',
  Dental: '#0891b2',
  Other: '#64748b',
};

function ApptForm({ residents, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    title: '', start: new Date().toISOString().split('T')[0],
    residentName: '', type: 'GP', location: '', notes: '',
  });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  function autoTitle() {
    if (!form.title && form.residentName) {
      const parts = form.residentName.split(' ');
      const initials = parts.length >= 2 ? `${parts[0]} ${parts[1][0]}.` : form.residentName;
      setForm(p => ({ ...p, title: `${initials} – ${p.type}` }));
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{initial ? 'Edit Appointment' : 'Add Appointment'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Resident *</label>
              <select
                required
                value={form.residentName}
                onChange={e => set('residentName', e.target.value)}
                onBlur={autoTitle}
                className={inputCls}
              >
                <option value="">Select resident...</option>
                {residents.map(r => (
                  <option key={r.id} value={`${r.firstName} ${r.lastName}`}>{r.firstName} {r.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Mary T – GP Review" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date *</label>
            <input required type="date" value={form.start} onChange={e => set('start', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. On-site / Off-site – City Clinic" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} className={inputCls + ' resize-none'} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              {initial ? 'Save Changes' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApptDetail({ appt, onEdit, onDelete, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: typeColors[appt.extendedProps?.type || appt.type] || typeColors.Other }} />
            <h2 className="font-semibold text-slate-800">{appt.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          {appt.extendedProps?.residentName && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              {appt.extendedProps.residentName}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            {new Date((appt.start || appt.extendedProps?.start || appt.startStr) + 'T00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          {appt.extendedProps?.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              {appt.extendedProps.location}
            </div>
          )}
          {appt.extendedProps?.notes && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
              {appt.extendedProps.notes}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
          <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={onEdit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit</button>
        </div>
      </div>
    </div>
  );
}

export default function Appointments() {
  const [residents, setResidents] = useState([]);
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [editAppt, setEditAppt] = useState(null);
  const calRef = useRef(null);

  useEffect(() => {
    Promise.all([getResidents(), getAppointments()])
      .then(([r, a]) => {
        setResidents(r);
        setAppts(a);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const events = appts.map(a => ({
    id: a.id,
    title: a.title,
    start: a.start,
    backgroundColor: typeColors[a.type] || typeColors.Other,
    borderColor: typeColors[a.type] || typeColors.Other,
    extendedProps: { residentName: a.residentName, type: a.type, location: a.location, notes: a.notes },
  }));

  async function handleAdd(data) {
    await addAppointment(data);
    const updated = await getAppointments();
    setAppts(updated);
    setShowForm(false);
  }

  async function handleEdit(data) {
    await updateAppointment(editAppt.id, data);
    const updated = await getAppointments();
    setAppts(updated);
    setEditAppt(null);
    setSelectedAppt(null);
  }

  async function handleDelete(id) {
    if (confirm('Delete this appointment?')) {
      await deleteAppointment(id);
      const updated = await getAppointments();
      setAppts(updated);
      setSelectedAppt(null);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading…</div>;
  if (error) return <div className="text-red-600 p-4 text-sm">Error: {error}</div>;

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appts.filter(a => a.start >= today).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 text-sm">Schedule and track resident appointments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Appointment
        </button>
      </div>

      {/* Type legend */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map(t => (
          <span key={t} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: typeColors[t] }} />
            {t}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4">
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
            events={events}
            eventClick={info => setSelectedAppt(info.event)}
            dateClick={info => {
              setEditAppt(null);
              setShowForm({ defaultDate: info.dateStr });
            }}
            height="auto"
            eventDisplay="block"
          />
        </div>

        {/* Upcoming list */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="font-semibold text-slate-800 mb-3">Upcoming</h3>
          {upcoming.length === 0 ? (
            <p className="text-slate-400 text-sm">No upcoming appointments.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map(a => (
                <li
                  key={a.id}
                  onClick={() => {
                    const ev = { id: a.id, title: a.title, start: a.start, extendedProps: { residentName: a.residentName, type: a.type, location: a.location, notes: a.notes } };
                    setSelectedAppt(ev);
                  }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: typeColors[a.type] || typeColors.Other }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{a.title}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(a.start + 'T00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    {a.location && <div className="text-xs text-slate-400 truncate">{a.location}</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showForm && (
        <ApptForm
          residents={residents}
          initial={showForm.defaultDate ? { title: '', start: showForm.defaultDate, residentName: '', type: 'GP', location: '', notes: '' } : null}
          onSave={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}

      {editAppt && (
        <ApptForm
          residents={residents}
          initial={appts.find(a => a.id === editAppt.id)}
          onSave={handleEdit}
          onClose={() => setEditAppt(null)}
        />
      )}

      {selectedAppt && !editAppt && (
        <ApptDetail
          appt={selectedAppt}
          onEdit={() => { setEditAppt(selectedAppt); setSelectedAppt(null); }}
          onDelete={() => handleDelete(selectedAppt.id)}
          onClose={() => setSelectedAppt(null)}
        />
      )}
    </div>
  );
}
