// Async Supabase-backed data store for Aged Care CMS
import { supabase } from './lib/supabase';

// ─── Column name maps (camelCase JS ↔ snake_case Postgres) ───────────────────

const RESIDENT_MAP = {
  firstName: 'first_name',
  lastName: 'last_name',
  roomNumber: 'room_number',
  careLevel: 'care_level',
  admissionDate: 'admission_date',
  gpPhone: 'gp_phone',
  nextOfKin: 'next_of_kin',
  nokRelation: 'nok_relation',
  nokPhone: 'nok_phone',
  medicalHistory: 'medical_history',
  createdAt: 'created_at',
};

const MED_MAP = {
  residentId: 'resident_id',
  startDate: 'start_date',
  createdAt: 'created_at',
};

const MAR_MAP = {
  medicationId: 'medication_id',
  residentId: 'resident_id',
  scheduledTime: 'scheduled_time',
  updatedAt: 'updated_at',
};

const NOTE_MAP = {
  residentId: 'resident_id',
  createdAt: 'created_at',
};

const VITALS_MAP = {
  residentId: 'resident_id',
  createdAt: 'created_at',
};

const APPT_MAP = {
  residentName: 'resident_name',
  createdAt: 'created_at',
};

function toDb(obj, map) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[map[k] || k] = v;
  }
  return result;
}

function fromDb(obj, map) {
  if (!obj) return null;
  const inverse = Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[inverse[k] || k] = v;
  }
  return result;
}

function fromDbList(list, map) {
  return (list || []).map(r => fromDb(r, map));
}

// ─── Residents ────────────────────────────────────────────────────────────────

export async function getResidents() {
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .order('last_name');
  if (error) throw error;
  return fromDbList(data, RESIDENT_MAP);
}

export async function getResident(id) {
  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return fromDb(data, RESIDENT_MAP);
}

export async function addResident(r) {
  const { data, error } = await supabase
    .from('residents')
    .insert(toDb(r, RESIDENT_MAP))
    .select()
    .single();
  if (error) throw error;
  return fromDb(data, RESIDENT_MAP);
}

export async function updateResident(id, changes) {
  const { error } = await supabase
    .from('residents')
    .update(toDb(changes, RESIDENT_MAP))
    .eq('id', id);
  if (error) throw error;
}

export async function deleteResident(id) {
  const { error } = await supabase
    .from('residents')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── Medications ──────────────────────────────────────────────────────────────

export async function getMedications(residentId) {
  let query = supabase.from('medications').select('*').order('name');
  if (residentId) query = query.eq('resident_id', residentId);
  const { data, error } = await query;
  if (error) throw error;
  return fromDbList(data, MED_MAP);
}

export async function addMedication(med) {
  const { data, error } = await supabase
    .from('medications')
    .insert(toDb(med, MED_MAP))
    .select()
    .single();
  if (error) throw error;
  return fromDb(data, MED_MAP);
}

export async function updateMedication(id, changes) {
  const { error } = await supabase
    .from('medications')
    .update(toDb(changes, MED_MAP))
    .eq('id', id);
  if (error) throw error;
}

export async function deleteMedication(id) {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── MAR Records ──────────────────────────────────────────────────────────────

export async function getMARRecords(residentId, date) {
  let query = supabase.from('mar_records').select('*');
  if (residentId) query = query.eq('resident_id', residentId);
  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  if (error) throw error;
  return fromDbList(data, MAR_MAP);
}

export async function recordMAR(entry) {
  const row = toDb(entry, MAR_MAP);
  const { data, error } = await supabase
    .from('mar_records')
    .upsert(row, { onConflict: 'medication_id,resident_id,date,scheduled_time' })
    .select()
    .single();
  if (error) throw error;
  return fromDb(data, MAR_MAP);
}

// ─── Clinical Notes ───────────────────────────────────────────────────────────

export async function getNotes(residentId) {
  let query = supabase
    .from('clinical_notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (residentId) query = query.eq('resident_id', residentId);
  const { data, error } = await query;
  if (error) throw error;
  return fromDbList(data, NOTE_MAP);
}

export async function addNote(note) {
  const { data, error } = await supabase
    .from('clinical_notes')
    .insert(toDb(note, NOTE_MAP))
    .select()
    .single();
  if (error) throw error;
  return fromDb(data, NOTE_MAP);
}

export async function deleteNote(id) {
  const { error } = await supabase
    .from('clinical_notes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── Vitals ───────────────────────────────────────────────────────────────────

export async function getVitals(residentId) {
  let query = supabase
    .from('vitals')
    .select('*')
    .order('created_at', { ascending: false });
  if (residentId) query = query.eq('resident_id', residentId);
  const { data, error } = await query;
  if (error) throw error;
  return fromDbList(data, VITALS_MAP);
}

export async function addVitals(entry) {
  const { data, error } = await supabase
    .from('vitals')
    .insert(toDb(entry, VITALS_MAP))
    .select()
    .single();
  if (error) throw error;
  return fromDb(data, VITALS_MAP);
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function getAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('start');
  if (error) throw error;
  return fromDbList(data, APPT_MAP);
}

export async function addAppointment(appt) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(toDb(appt, APPT_MAP))
    .select()
    .single();
  if (error) throw error;
  return fromDb(data, APPT_MAP);
}

export async function updateAppointment(id, changes) {
  const { error } = await supabase
    .from('appointments')
    .update(toDb(changes, APPT_MAP))
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAppointment(id) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
