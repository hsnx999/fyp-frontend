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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg")',
            filter: 'brightness(0.5)'
          }}
        ></div>

        <div className="relative min-h-screen flex flex-col">
          <header className="bg-transparent z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Stethoscope className="h-8 w-8 text-blue-400 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">ThoraScan</h1>
                    <p className="text-sm text-blue-200">Thoracic Oncology Diagnostic Assistant</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-grow flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-bold text-white mb-4">
                Advanced Thoracic Diagnostics
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Empowering healthcare professionals with AI-driven thoracic cancer diagnostics and patient management.
              </p>
              <Button 
                onClick={() => setIsAuthModalOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg shadow-lg transform transition hover:scale-105"
              >
                <LogIn size={20} className="mr-2" />
                Get Started
              </Button>
            </div>
          </main>

          <footer className="bg-transparent z-10 py-4">
            <div className="text-center text-blue-200 text-sm">
              © 2025 ThoraScan. All rights reserved.
            </div>
          </footer>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex bg-gray-100">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Sidebar */}
        <Sidebar 
          user={user} 
          onSignOut={handleSignOut} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        {/* Main content */}
        <div className="flex-1 lg:ml-64 transition-all duration-300 ease-in-out">
          <div className="p-4 sm:p-8">
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