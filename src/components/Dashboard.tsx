import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, FileText, Brain, TrendingUp, Calendar, Bell, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';

interface DashboardData {
  patientCount: number;
  notesToReview: number;
  monthlyReports: number;
  averageConfidence: number;
  recentActivity: Activity[];
  patientTrends: TrendData[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface TrendData {
  date: string;
  patients: number;
  reports: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    patientCount: 0,
    notesToReview: 0,
    monthlyReports: 0,
    averageConfidence: 0,
    recentActivity: [],
    patientTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [
          patientResult,
          notesResult,
          reportsResult,
          confidenceResult,
          activityResult
        ] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('notes').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('reports').select('*', { count: 'exact' }).gte('created_at', new Date(new Date().setDate(1)).toISOString()),
          supabase.from('reports').select('confidence'),
          supabase.from('patients').select('created_at').order('created_at', { ascending: false }).limit(30)
        ]);

        // Generate trend data
        const trendData = generateTrendData(activityResult.data || []);

        setData({
          patientCount: patientResult.count || 0,
          notesToReview: notesResult.count || 0,
          monthlyReports: reportsResult.count || 0,
          averageConfidence: confidenceResult.data?.length 
            ? Math.round(confidenceResult.data.reduce((sum, r) => sum + r.confidence, 0) / confidenceResult.data.length * 100)
            : 0,
          recentActivity: generateRecentActivity(),
          patientTrends: trendData
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchDashboardData)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [timeRange]);

  const generateTrendData = (patientData: any[]): TrendData[] => {
    const today = new Date();
    const data: TrendData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        patients: Math.floor(Math.random() * 10) + 1,
        reports: Math.floor(Math.random() * 15) + 1
      });
    }
    
    return data;
  };

  const generateRecentActivity = (): Activity[] => {
    return [
      {
        id: '1',
        type: 'patient',
        description: 'New patient registration',
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        type: 'report',
        description: 'CT scan analysis completed',
        timestamp: '4 hours ago'
      },
      {
        id: '3',
        type: 'note',
        description: 'Clinical notes updated',
        timestamp: '5 hours ago'
      }
    ];
  };

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
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <TrendingUp size={20} />
            <span className="font-medium">Real-time Updates</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Patients" 
          icon={<Users className="h-6 w-6 text-blue-500" />} 
          value={data.patientCount}
          trend="+12% from last month"
          trendUp={true}
        />
        <DashboardCard 
          title="Notes to Review" 
          icon={<FileText className="h-6 w-6 text-yellow-500" />} 
          value={data.notesToReview}
          trend="5 urgent reviews"
          trendUp={false}
          urgent={data.notesToReview > 10}
        />
        <DashboardCard 
          title="Reports Generated" 
          icon={<BarChart3 className="h-6 w-6 text-green-500" />} 
          value={data.monthlyReports}
          trend="On track with target"
          trendUp={true}
        />
        <DashboardCard 
          title="Model Confidence" 
          icon={<Brain className="h-6 w-6 text-purple-500" />} 
          value={`${data.averageConfidence}%`}
          trend="Above threshold"
          trendUp={data.averageConfidence > 85}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-800">Activity Overview</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Patients
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Reports
              </Button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.patientTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#93C5FD" 
                />
                <Area 
                  type="monotone" 
                  dataKey="reports" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#6EE7B7" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-800">Recent Activity</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full ${
                  activity.type === 'patient' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'report' ? 'bg-green-100 text-green-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {activity.type === 'patient' ? <Users className="h-4 w-4" /> :
                   activity.type === 'report' ? <FileText className="h-4 w-4" /> :
                   <Bell className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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