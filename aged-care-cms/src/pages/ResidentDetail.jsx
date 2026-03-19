import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Pill, FileText, AlertTriangle, Phone, User, Heart } from 'lucide-react';
import { getResident, updateResident, deleteResident, getMedications, getNotes } from '../store';
import ResidentForm from '../components/ResidentForm';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-5 gap-2 py-2 border-b border-slate-50 last:border-0">
      <dt className="text-xs text-slate-400 font-medium col-span-2">{label}</dt>
      <dd className="text-sm text-slate-800 col-span-3">{value}</dd>
    </div>
  );
}

export default function ResidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resident, setResident] = useState(null);
  const [medications, setMedications] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setLoading(true);
    Promise.all([getResident(id), getMedications(id), getNotes(id)])
      .then(([r, meds, ns]) => {
        setResident(r);
        setMedications(meds);
        setNotes(ns);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Loading…</div>;
  if (error) return <div className="text-red-600 p-4 text-sm">Error: {error}</div>;

  if (!resident) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Resident not found.</p>
        <button onClick={() => navigate('/residents')} className="mt-4 text-blue-600 text-sm hover:underline">Back to residents</button>
      </div>
    );
  }

  async function handleEdit(data) {
    await updateResident(id, data);
    const updated = await getResident(id);
    setResident(updated);
    setShowEdit(false);
  }

  async function handleDelete() {
    if (confirm(`Are you sure you want to remove ${resident.firstName} ${resident.lastName}?`)) {
      await deleteResident(id);
      navigate('/residents');
    }
  }

  const careLevelColor = {
    High: 'bg-orange-100 text-orange-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
    Respite: 'bg-purple-100 text-purple-700',
  };

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'medications', label: `Medications (${medications.length})` },
    { key: 'notes', label: `Notes (${notes.length})` },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/residents')} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-800">{resident.firstName} {resident.lastName}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${careLevelColor[resident.careLevel]}`}>
              {resident.careLevel} Care
            </span>
            {resident.dnr && <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">DNR</span>}
            {resident.dni && <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">DNI</span>}
          </div>
          <p className="text-slate-500 text-sm">Room {resident.roomNumber}</p>
        </div>
        <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
          <Edit className="w-4 h-4" /> Edit
        </button>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 rounded-lg hover:bg-red-50 text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Allergy banner */}
      {resident.allergies && resident.allergies.toLowerCase() !== 'none known' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Allergies:</span>
          <span className="text-sm">{resident.allergies}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Personal Details
            </h3>
            <dl className="space-y-0">
              <InfoRow label="Date of Birth" value={resident.dob ? new Date(resident.dob + 'T00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
              <InfoRow label="Room" value={resident.roomNumber} />
              <InfoRow label="Admission Date" value={resident.admissionDate ? new Date(resident.admissionDate + 'T00:00').toLocaleDateString('en-AU') : null} />
              <InfoRow label="Care Level" value={resident.careLevel} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> Contacts
            </h3>
            <dl className="space-y-0">
              <InfoRow label="GP" value={resident.gp} />
              <InfoRow label="GP Phone" value={resident.gpPhone} />
              <InfoRow label="Next of Kin" value={resident.nextOfKin ? `${resident.nextOfKin} (${resident.nokRelation || 'relation'})` : null} />
              <InfoRow label="NOK Phone" value={resident.nokPhone} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-slate-400" /> Medical History
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-line">{resident.medicalHistory || 'No medical history recorded.'}</p>
          </div>
        </div>
      )}

      {/* Medications tab */}
      {activeTab === 'medications' && (
        <div className="space-y-3">
          {medications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No medications recorded. Add medications in the Medications module.</p>
            </div>
          ) : (
            medications.map(med => (
              <div key={med.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{med.name} <span className="text-slate-500 font-normal">{med.dose}</span></div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      {med.route} &middot; {med.frequency} &middot; {med.times?.join(', ')}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Indication: {med.indication} &middot; Prescribed by: {med.prescriber}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${med.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {med.active ? 'Active' : 'Ceased'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notes tab */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No clinical notes. Add notes in the Clinical Notes module.</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    note.type === 'Progress' ? 'bg-blue-100 text-blue-700' :
                    note.type === 'Wound' ? 'bg-red-100 text-red-700' :
                    note.type === 'Incident' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{note.type}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(note.createdAt).toLocaleString('en-AU')}
                  </span>
                  {note.author && <span className="text-xs text-slate-400 ml-auto">{note.author}</span>}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-line">{note.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {showEdit && (
        <ResidentForm resident={resident} onSave={handleEdit} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}
