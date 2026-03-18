import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronRight, UserPlus } from 'lucide-react';
import { getResidents, addResident } from '../store';
import ResidentForm from '../components/ResidentForm';

export default function Residents() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState(getResidents);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = residents.filter(r =>
    `${r.firstName} ${r.lastName} ${r.roomNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd(data) {
    const newR = addResident(data);
    setResidents(getResidents());
    setShowForm(false);
  }

  const careLevelColor = {
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
    Respite: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Residents</h1>
          <p className="text-slate-500 text-sm">{residents.length} resident{residents.length !== 1 ? 's' : ''} in care</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4" />
          Add Resident
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or room..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No residents found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(r => (
            <div
              key={r.id}
              onClick={() => navigate(`/residents/${r.id}`)}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-base flex-shrink-0">
                {r.firstName[0]}{r.lastName[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800">{r.firstName} {r.lastName}</span>
                  {r.dnr && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">DNR</span>}
                  {r.dni && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">DNI</span>}
                </div>
                <div className="text-sm text-slate-500 mt-0.5">
                  Room {r.roomNumber} &middot; DOB: {r.dob ? new Date(r.dob + 'T00:00').toLocaleDateString('en-AU') : '—'} &middot; GP: {r.gp || '—'}
                </div>
                {r.allergies && r.allergies !== 'None known' && (
                  <div className="text-xs text-red-600 mt-1">⚠ Allergies: {r.allergies}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${careLevelColor[r.careLevel] || careLevelColor.Low}`}>
                  {r.careLevel} Care
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ResidentForm
          onSave={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
