import { useState } from 'react';
import { X } from 'lucide-react';

const EMPTY = {
  firstName: '', lastName: '', dob: '', roomNumber: '',
  careLevel: 'High', admissionDate: '',
  gp: '', gpPhone: '',
  nextOfKin: '', nokRelation: '', nokPhone: '',
  allergies: '', medicalHistory: '',
  dni: false, dnr: false,
};

export default function ResidentForm({ resident, onSave, onClose }) {
  const [form, setForm] = useState(resident ? { ...resident } : { ...EMPTY });

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  function submit(e) {
    e.preventDefault();
    onSave(form);
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {resident ? 'Edit Resident' : 'Add New Resident'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5">
          {/* Personal details */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">Personal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>First Name *</label>
                <input required value={form.firstName} onChange={e => set('firstName', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Last Name *</label>
                <input required value={form.lastName} onChange={e => set('lastName', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Room Number *</label>
                <input required value={form.roomNumber} onChange={e => set('roomNumber', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Care Level</label>
                <select value={form.careLevel} onChange={e => set('careLevel', e.target.value)} className={inputCls}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                  <option>Respite</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Admission Date</label>
                <input type="date" value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          {/* GP */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">General Practitioner</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>GP Name</label>
                <input value={form.gp} onChange={e => set('gp', e.target.value)} placeholder="Dr. " className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>GP Phone</label>
                <input value={form.gpPhone} onChange={e => set('gpPhone', e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          {/* Next of kin */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">Next of Kin</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Name</label>
                <input value={form.nextOfKin} onChange={e => set('nextOfKin', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Relationship</label>
                <input value={form.nokRelation} onChange={e => set('nokRelation', e.target.value)} placeholder="e.g. Son" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input value={form.nokPhone} onChange={e => set('nokPhone', e.target.value)} className={inputCls} />
              </div>
            </div>
          </section>

          {/* Clinical */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b border-slate-100">Clinical Information</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Known Allergies</label>
                <input value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="e.g. Penicillin, Sulfa drugs" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Medical History / Diagnoses</label>
                <textarea rows={3} value={form.medicalHistory} onChange={e => set('medicalHistory', e.target.value)} className={inputCls + ' resize-none'} />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.dnr} onChange={e => set('dnr', e.target.checked)} className="w-4 h-4 accent-red-600" />
                  Do Not Resuscitate (DNR)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.dni} onChange={e => set('dni', e.target.checked)} className="w-4 h-4 accent-amber-600" />
                  Do Not Intubate (DNI)
                </label>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              {resident ? 'Save Changes' : 'Add Resident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
