import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AuthModal from './components/auth/AuthModal';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientDetails from './components/patients/PatientDetails';
import Analysis from './components/Analysis';
import { Stethoscope, LogIn, LayoutDashboard, Users, Activity } from 'lucide-react';
import { Button } from './components/ui/Button';
import Sidebar from './components/Sidebar';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    // Handle Auth State Change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Fetch patient data
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      if (error) {
        console.error(error);
      } else {
        setPatients(data);
      }
    };

    fetchPatients();

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking the auth status
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Stethoscope className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ThoraScan</h1>
                  <p className="text-sm text-gray-500">Thoracic Oncology Diagnostic Assistant</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to ThoraScan</h2>
            <p className="text-gray-600 mb-8">Please sign in to access the diagnostic assistant.</p>
            <Button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2">
              <LogIn size={18} />
              Sign In
            </Button>
          </div>
        </main>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex">
        <Sidebar user={user} onSignOut={handleSignOut} />
        
        <div className="flex-1 ml-64 bg-gray-100">
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/analysis" element={<Analysis />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
