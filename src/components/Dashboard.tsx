import React, { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, Brain, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [notesToReview, setNotesToReview] = useState(0);
  const [monthlyReports, setMonthlyReports] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [
          patientResult,
          notesResult,
          reportsResult,
          confidenceResult
        ] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('notes').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('reports').select('*', { count: 'exact' }).gte('created_at', new Date(new Date().setDate(1)).toISOString()),
          supabase.from('reports').select('confidence')
        ]);

        setPatientCount(patientResult.count || 0);
        setNotesToReview(notesResult.count || 0);
        setMonthlyReports(reportsResult.count || 0);

        if (confidenceResult.data?.length) {
          const avg = confidenceResult.data.reduce((sum, r) => sum + r.confidence, 0) / confidenceResult.data.length;
          setAverageConfidence(Math.round(avg * 100));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor key metrics and patient statistics</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <TrendingUp size={20} />
          <span className="font-medium">Real-time Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Patients" 
          icon={<Users className="h-6 w-6 text-blue-500" />} 
          value={patientCount}
          trend="+12% from last month"
          trendUp={true}
        />
        <DashboardCard 
          title="Notes to Review" 
          icon={<FileText className="h-6 w-6 text-yellow-500" />} 
          value={notesToReview}
          trend="5 urgent reviews"
          trendUp={false}
          urgent={notesToReview > 10}
        />
        <DashboardCard 
          title="Reports Generated" 
          icon={<BarChart3 className="h-6 w-6 text-green-500" />} 
          value={monthlyReports}
          trend="On track with target"
          trendUp={true}
        />
        <DashboardCard 
          title="Model Confidence" 
          icon={<Brain className="h-6 w-6 text-purple-500" />} 
          value={`${averageConfidence}%`}
          trend="Above threshold"
          trendUp={averageConfidence > 85}
        />
      </div>
    </div>
  );
};

const DashboardCard = ({ 
  title, 
  icon, 
  value, 
  trend, 
  trendUp, 
  urgent 
}: { 
  title: string;
  icon: React.ReactNode;
  value: number | string;
  trend: string;
  trendUp: boolean;
  urgent?: boolean;
}) => (
  <div className={`bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg ${
    urgent ? 'border-l-4 border-yellow-500' : ''
  }`}>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className={`text-sm flex items-center gap-1 ${
        trendUp ? 'text-green-600' : 'text-gray-500'
      }`}>
        {trendUp ? (
          <TrendingUp size={16} />
        ) : (
          <span className="text-gray-400">•</span>
        )}
        {trend}
      </p>
    </div>
  </div>
);

export default Dashboard;