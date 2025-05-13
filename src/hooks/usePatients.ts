import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: string;
  diagnosis: string;
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from('patients').select('*');
      if (error) console.error('Error fetching patients:', error);
      else setPatients(data as Patient[]);
      setLoading(false);
    };

    fetchPatients();
  }, []);

  return { patients, loading };
}
