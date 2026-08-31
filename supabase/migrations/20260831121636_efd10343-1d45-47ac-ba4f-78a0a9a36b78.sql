CREATE SEQUENCE IF NOT EXISTS public.patient_uid_seq START 1;

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_uid text UNIQUE NOT NULL,
  name text NOT NULL,
  age int,
  sex text,
  phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patients_phone_idx ON public.patients (phone);

CREATE OR REPLACE FUNCTION public.set_patient_uid()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.patient_uid IS NULL OR NEW.patient_uid = '' THEN
    NEW.patient_uid := 'SHB-' || lpad(nextval('public.patient_uid_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER patients_set_uid BEFORE INSERT ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.set_patient_uid();

ALTER TABLE public.patients ALTER COLUMN patient_uid DROP NOT NULL;

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  phone text NOT NULL,
  reason text,
  appointment_date date NOT NULL,
  slot_time text NOT NULL,
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','done','cancelled','no_show')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX appointments_date_idx ON public.appointments (appointment_date);
CREATE INDEX appointments_patient_idx ON public.appointments (patient_id);

CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  rx_date date NOT NULL DEFAULT current_date,
  vitals jsonb NOT NULL DEFAULT '{}'::jsonb,
  chief_complaint text,
  diagnosis text,
  medicines jsonb NOT NULL DEFAULT '[]'::jsonb,
  facilities_advised text[],
  advice text,
  tests text,
  follow_up_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX prescriptions_patient_idx ON public.prescriptions (patient_id);

CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  prescription_id uuid REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  recipient_name text,
  recipient_phone text NOT NULL,
  type text NOT NULL CHECK (type IN ('appointment','follow_up','missed','doctor_daily','upcoming')),
  channel text NOT NULL DEFAULT 'whatsapp',
  message text NOT NULL,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','failed','skipped')),
  delivery_status text,
  error_message text,
  dedupe_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reminders_status_idx ON public.reminders (status, scheduled_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;
GRANT USAGE ON SEQUENCE public.patient_uid_seq TO authenticated;
GRANT ALL ON public.patients TO service_role;
GRANT ALL ON public.appointments TO service_role;
GRANT ALL ON public.prescriptions TO service_role;
GRANT ALL ON public.reminders TO service_role;
GRANT USAGE ON SEQUENCE public.patient_uid_seq TO service_role;

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY authenticated_staff_can_read_patients ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_staff_can_insert_patients ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY authenticated_staff_can_update_patients ON public.patients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_staff_can_delete_patients ON public.patients FOR DELETE TO authenticated USING (true);

CREATE POLICY authenticated_staff_can_read_appointments ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_staff_can_insert_appointments ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY authenticated_staff_can_update_appointments ON public.appointments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_staff_can_delete_appointments ON public.appointments FOR DELETE TO authenticated USING (true);

CREATE POLICY authenticated_staff_can_read_prescriptions ON public.prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_staff_can_insert_prescriptions ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY authenticated_staff_can_update_prescriptions ON public.prescriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_staff_can_delete_prescriptions ON public.prescriptions FOR DELETE TO authenticated USING (true);

CREATE POLICY authenticated_staff_can_read_reminders ON public.reminders FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_staff_can_insert_reminders ON public.reminders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY authenticated_staff_can_update_reminders ON public.reminders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_staff_can_delete_reminders ON public.reminders FOR DELETE TO authenticated USING (true);