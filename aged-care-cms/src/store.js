// Simple localStorage-backed data store for Aged Care CMS

const KEYS = {
  residents: 'acms_residents',
  medications: 'acms_medications',
  marRecords: 'acms_mar',
  notes: 'acms_notes',
  vitals: 'acms_vitals',
  appointments: 'acms_appointments',
};

function load(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------- Residents ----------
export function getResidents() {
  return load(KEYS.residents) || seedResidents();
}

export function saveResidents(list) {
  save(KEYS.residents, list);
}

export function addResident(r) {
  const list = getResidents();
  const newR = { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  saveResidents([...list, newR]);
  return newR;
}

export function updateResident(id, changes) {
  const list = getResidents().map(r => r.id === id ? { ...r, ...changes } : r);
  saveResidents(list);
}

export function deleteResident(id) {
  saveResidents(getResidents().filter(r => r.id !== id));
}

// ---------- Medications ----------
export function getMedications(residentId) {
  const all = load(KEYS.medications) || [];
  return residentId ? all.filter(m => m.residentId === residentId) : all;
}

export function addMedication(med) {
  const all = load(KEYS.medications) || [];
  const newMed = { ...med, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  save(KEYS.medications, [...all, newMed]);
  return newMed;
}

export function updateMedication(id, changes) {
  const all = (load(KEYS.medications) || []).map(m => m.id === id ? { ...m, ...changes } : m);
  save(KEYS.medications, all);
}

export function deleteMedication(id) {
  save(KEYS.medications, (load(KEYS.medications) || []).filter(m => m.id !== id));
}

// ---------- MAR (Medication Administration Records) ----------
export function getMARRecords(residentId, date) {
  const all = load(KEYS.marRecords) || [];
  return all.filter(r =>
    (!residentId || r.residentId === residentId) &&
    (!date || r.date === date)
  );
}

export function recordMAR(entry) {
  const all = load(KEYS.marRecords) || [];
  const existing = all.findIndex(r =>
    r.medicationId === entry.medicationId &&
    r.residentId === entry.residentId &&
    r.date === entry.date &&
    r.scheduledTime === entry.scheduledTime
  );
  const record = { ...entry, id: existing >= 0 ? all[existing].id : crypto.randomUUID(), updatedAt: new Date().toISOString() };
  if (existing >= 0) {
    all[existing] = record;
  } else {
    all.push(record);
  }
  save(KEYS.marRecords, all);
  return record;
}

// ---------- Clinical Notes ----------
export function getNotes(residentId) {
  const all = load(KEYS.notes) || [];
  return residentId ? all.filter(n => n.residentId === residentId) : all;
}

export function addNote(note) {
  const all = load(KEYS.notes) || [];
  const newNote = { ...note, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  save(KEYS.notes, [...all, newNote]);
  return newNote;
}

export function deleteNote(id) {
  save(KEYS.notes, (load(KEYS.notes) || []).filter(n => n.id !== id));
}

// ---------- Vitals ----------
export function getVitals(residentId) {
  const all = load(KEYS.vitals) || [];
  return residentId ? all.filter(v => v.residentId === residentId) : all;
}

export function addVitals(entry) {
  const all = load(KEYS.vitals) || [];
  const newEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  save(KEYS.vitals, [...all, newEntry]);
  return newEntry;
}

// ---------- Appointments ----------
export function getAppointments() {
  return load(KEYS.appointments) || seedAppointments();
}

export function addAppointment(appt) {
  const all = getAppointments();
  const newAppt = { ...appt, id: crypto.randomUUID() };
  save(KEYS.appointments, [...all, newAppt]);
  return newAppt;
}

export function updateAppointment(id, changes) {
  const all = getAppointments().map(a => a.id === id ? { ...a, ...changes } : a);
  save(KEYS.appointments, all);
}

export function deleteAppointment(id) {
  save(KEYS.appointments, getAppointments().filter(a => a.id !== id));
}

// ---------- Seed Data ----------
function seedResidents() {
  const residents = [
    {
      id: crypto.randomUUID(),
      firstName: 'Mary', lastName: 'Thompson',
      dob: '1938-04-12', roomNumber: '12A',
      careLevel: 'High', admissionDate: '2022-03-15',
      gp: 'Dr. Sarah Mitchell', gpPhone: '(02) 5555-1234',
      nextOfKin: 'John Thompson', nokRelation: 'Son', nokPhone: '0412 345 678',
      allergies: 'Penicillin, Sulfa drugs',
      medicalHistory: 'Type 2 Diabetes, Hypertension, Mild cognitive impairment',
      dni: false, dnr: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Robert', lastName: 'Davies',
      dob: '1933-11-28', roomNumber: '7B',
      careLevel: 'High', admissionDate: '2021-08-22',
      gp: 'Dr. James Wilson', gpPhone: '(02) 5555-5678',
      nextOfKin: 'Patricia Davies', nokRelation: 'Wife', nokPhone: '0423 456 789',
      allergies: 'Aspirin, Latex',
      medicalHistory: 'Parkinson\'s disease, Osteoporosis, COPD',
      dni: true, dnr: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      firstName: 'Joan', lastName: 'Baker',
      dob: '1940-07-05', roomNumber: '3C',
      careLevel: 'Low', admissionDate: '2023-01-10',
      gp: 'Dr. Sarah Mitchell', gpPhone: '(02) 5555-1234',
      nextOfKin: 'Susan Baker', nokRelation: 'Daughter', nokPhone: '0434 567 890',
      allergies: 'None known',
      medicalHistory: 'Hypertension, Cataracts (post-op), Mild arthritis',
      dni: false, dnr: false,
      createdAt: new Date().toISOString(),
    },
  ];
  save(KEYS.residents, residents);
  // seed medications too
  const meds = [
    { id: crypto.randomUUID(), residentId: residents[0].id, name: 'Metformin', dose: '500mg', route: 'Oral', frequency: 'BD', times: ['08:00', '18:00'], indication: 'Type 2 Diabetes', prescriber: 'Dr. Mitchell', startDate: '2022-03-15', active: true, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), residentId: residents[0].id, name: 'Amlodipine', dose: '5mg', route: 'Oral', frequency: 'OD', times: ['08:00'], indication: 'Hypertension', prescriber: 'Dr. Mitchell', startDate: '2022-03-15', active: true, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), residentId: residents[1].id, name: 'Levodopa/Carbidopa', dose: '100/25mg', route: 'Oral', frequency: 'TDS', times: ['07:00', '12:00', '17:00'], indication: 'Parkinson\'s disease', prescriber: 'Dr. Wilson', startDate: '2021-08-22', active: true, createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), residentId: residents[2].id, name: 'Perindopril', dose: '4mg', route: 'Oral', frequency: 'OD', times: ['08:00'], indication: 'Hypertension', prescriber: 'Dr. Mitchell', startDate: '2023-01-10', active: true, createdAt: new Date().toISOString() },
  ];
  save(KEYS.medications, meds);
  return residents;
}

function seedAppointments() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const appts = [
    { id: crypto.randomUUID(), title: 'Mary T – GP Review', start: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)), residentName: 'Mary Thompson', type: 'GP', location: 'On-site', notes: 'Quarterly diabetes review' },
    { id: crypto.randomUUID(), title: 'Robert D – Physiotherapy', start: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)), residentName: 'Robert Davies', type: 'Allied Health', location: 'Physiotherapy room', notes: 'Parkinson\'s exercise program' },
    { id: crypto.randomUUID(), title: 'Joan B – Optometry', start: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)), residentName: 'Joan Baker', type: 'Specialist', location: 'Off-site – City Eye Clinic', notes: 'Post-cataract follow up' },
  ];
  save(KEYS.appointments, appts);
  return appts;
}
