import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Pill, FileText, CalendarDays, AlertTriangle } from 'lucide-react';
import { getResidents, getMedications, getNotes, getAppointments } from '../store';

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [medications, setMedications] = useState([]);
  const [notes, setNotes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getResidents(), getMedications(), getNotes(), getAppointments()])
      .then(([r, m, n, a]) => {
        setResidents(r);
        setMedications(m);
        setNotes(n);
        setAppointments(a);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading…</div>;
  if (error) return <div className="text-red-600 p-4 text-sm">Error: {error}</div>;

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppts = appointments
    .filter(a => a.start >= today)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 5);

  const recentNotes = notes.slice(0, 5);

  const highCare = residents.filter(r => r.careLevel === 'High').length;

  const apptTypeColor = {
    GP: 'bg-blue-100 text-blue-700',
    Specialist: 'bg-purple-100 text-purple-700',
    'Allied Health': 'bg-green-100 text-green-700',
    Other: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Residents" value={residents.length} color="bg-blue-600" onClick={() => navigate('/residents')} />
        <StatCard icon={AlertTriangle} label="High Care" value={highCare} color="bg-orange-500" />
        <StatCard icon={Pill} label="Active Medications" value={medications.filter(m => m.active).length} color="bg-purple-600" onClick={() => navigate('/medications')} />
        <StatCard icon={CalendarDays} label="Upcoming Appts" value={upcomingAppts.length} color="bg-teal-600" onClick={() => navigate('/appointments')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Upcoming Appointments</h2>
            <button onClick={() => navigate('/appointments')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {upcomingAppts.length === 0 ? (
            <p className="text-slate-400 text-sm">No upcoming appointments.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingAppts.map(appt => (
                <li key={appt.id} className="flex items-start gap-3">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{appt.title}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(appt.start + 'T00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {appt.type && <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${apptTypeColor[appt.type] || apptTypeColor.Other}`}>{appt.type}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Residents overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Residents</h2>
            <button onClick={() => navigate('/residents')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {residents.length === 0 ? (
            <p className="text-slate-400 text-sm">No residents added yet.</p>
          ) : (
            <ul className="space-y-2">
              {residents.map(r => (
                <li
                  key={r.id}
                  onClick={() => navigate(`/residents/${r.id}`)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                    {r.firstName[0]}{r.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{r.firstName} {r.lastName}</div>
                    <div className="text-xs text-slate-500">Room {r.roomNumber} &middot; {r.careLevel} Care</div>
                  </div>
                  {r.careLevel === 'High' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">High</span>
                  )}
                  {r.dnr && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">DNR</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Clinical Notes</h2>
            <button onClick={() => navigate('/notes')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {recentNotes.length === 0 ? (
            <p className="text-slate-400 text-sm">No clinical notes recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentNotes.map(note => {
                const resident = residents.find(r => r.id === note.residentId);
                return (
                  <div key={note.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-800">
                        {resident ? `${resident.firstName} ${resident.lastName}` : 'Unknown Resident'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        note.type === 'Progress' ? 'bg-blue-100 text-blue-700' :
                        note.type === 'Wound' ? 'bg-red-100 text-red-700' :
                        note.type === 'Incident' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{note.type}</span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {new Date(note.createdAt).toLocaleDateString('en-AU')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{note.content}</p>
                    {note.author && <p className="text-xs text-slate-400 mt-1">— {note.author}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
