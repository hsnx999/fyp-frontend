import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientAdded,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    diagnosis: '',
    status: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError('You must be logged in to add a patient.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('patients').insert([
      {
        ...formData,
        age: Number(formData.age), // convert age to number
        last_visit: new Date().toISOString(),
        user_id: user.id, // ensure this field exists in your table
      },
    ]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      onPatientAdded(); // refresh patient list
      onClose(); // close modal
      setFormData({ name: '', age: '', gender: '', diagnosis: '', status: '' }); // reset
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <div className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Patient Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md"
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            name="diagnosis"
            placeholder="Diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-md"
          >
            <option value="">Select Status</option>
            <option value="Stable">Stable</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Patient'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;
