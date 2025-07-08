import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, FileText, Brain, TrendingUp, Calendar, Bell, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';

interface DashboardData {
  patientCount: number;
  patientGrowth: number;
  notesToReview: number;
  monthlyReports: number;
  reportGrowth: number;
  averageConfidence: number;
  recentActivity: Activity[];
  patientTrends: TrendData[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  patient_name?: string;
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
    patientGrowth: 0,
    notesToReview: 0,
    monthlyReports: 0,
    reportGrowth: 0,
    averageConfidence: 0,
    recentActivity: [],
    patientTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Error getting user:', userError);
          return;
        }

        // Get current user's patient IDs
        const { data: userPatients, error: patientsError } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', user.id);

        if (patientsError) {
          console.error('Error fetching user patients:', patientsError);
          return;
        }

        const patientIds = userPatients?.map(p => p.id) || [];
        
        // If user has no patients, set empty data
        if (patientIds.length === 0) {
          setData({
            patientCount: 0,
            patientGrowth: 0,
            notesToReview: 0,
            monthlyReports: 0,
            reportGrowth: 0,
            averageConfidence: 0,
            recentActivity: [],
            patientTrends: []
          });
          return;
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Fetch current month's patient count
        const { count: currentPatients } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch last month's patient count
        const { count: lastMonthPatients } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lte('created_at', lastDayOfLastMonth.toISOString())
          .gte('created_at', firstDayOfLastMonth.toISOString());

        // Calculate patient growth
        const patientGrowth = lastMonthPatients 
          ? ((currentPatients - lastMonthPatients) / lastMonthPatients) * 100 
          : 0;

        // Fetch notes requiring review
        const { count: pendingNotes } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .in('patient_id', patientIds);

        // Fetch current month's reports
        const { count: currentReports } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonth.toISOString())
          .in('patient_id', patientIds);

        // Fetch last month's reports
        const { count: lastMonthReports } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .in('patient_id', patientIds)
          .lte('created_at', lastDayOfLastMonth.toISOString())
          .gte('created_at', firstDayOfLastMonth.toISOString());

        // Calculate report growth
        const reportGrowth = lastMonthReports 
          ? ((currentReports - lastMonthReports) / lastMonthReports) * 100 
          : 0;

        // Fetch average confidence
        const { data: confidenceData } = await supabase
          .from('reports')
          .select('confidence')
          .gte('created_at', firstDayOfMonth.toISOString())
          .in('patient_id', patientIds);

        const averageConfidence = confidenceData?.length
          ? Math.round(
              confidenceData.reduce((sum, report) => sum + report.confidence, 0) / 
              confidenceData.length * 100
            )
          : 0;

        // Fetch recent activity
        const { data: recentActivityData } = await supabase
          .from('patients')
          .select(`
            id,
            name,
            created_at,
            notes (id, status, created_at),
            reports (id, created_at)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const recentActivity = recentActivityData?.map(patient => ({
          id: patient.id,
          type: 'patient',
          description: `New patient: ${patient.name}`,
          timestamp: new Date(patient.created_at).toLocaleString(),
          patient_name: patient.name
        })) || [];

        // Fetch trend data based on timeRange
        const trendData = await fetchTrendData(timeRange, patientIds);

        setData({
          patientCount: currentPatients || 0,
          patientGrowth,
          notesToReview: pendingNotes || 0,
          monthlyReports: currentReports || 0,
          reportGrowth,
          averageConfidence,
          recentActivity,
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
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'patients'
      }, fetchDashboardData)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notes'
      }, fetchDashboardData)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reports'
      }, fetchDashboardData)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [timeRange]);

  const fetchTrendData = async (range: string, patientIds: string[]): Promise<TrendData[]> => {
    if (patientIds.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate: Date;
    let interval: string;

    switch (range) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 7));
        interval = 'day';
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 28));
        interval = 'week';
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        interval = 'month';
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
        interval = 'day';
    }

    // Since we need to filter by user's patients, we'll calculate trends manually
    // Get patients data
    const { data: patientsData } = await supabase
      .from('patients')
      .select('created_at')
      .in('id', patientIds)
      .gte('created_at', startDate.toISOString());

    // Get reports data
    const { data: reportsData } = await supabase
      .from('reports')
      .select('created_at')
      .in('patient_id', patientIds)
      .gte('created_at', startDate.toISOString());

    // Group data by interval
    const trendMap = new Map<string, { patients: number; reports: number }>();
    
    // Initialize all intervals with 0 counts
    const current = new Date(startDate);
    while (current <= new Date()) {
      const key = formatDateForInterval(current, interval);
      trendMap.set(key, { patients: 0, reports: 0 });
      
      // Increment by interval
      if (interval === 'day') {
        current.setDate(current.getDate() + 1);
      } else if (interval === 'week') {
        current.setDate(current.getDate() + 7);
      } else if (interval === 'month') {
        current.setMonth(current.getMonth() + 1);
      }
    }

    // Count patients
    patientsData?.forEach(patient => {
      const key = formatDateForInterval(new Date(patient.created_at), interval);
      const existing = trendMap.get(key);
      if (existing) {
        existing.patients += 1;
      }
    });

    // Count reports
    reportsData?.forEach(report => {
      const key = formatDateForInterval(new Date(report.created_at), interval);
      const existing = trendMap.get(key);
      if (existing) {
        existing.reports += 1;
      }
    });

    // Convert to array format
    const trendData = Array.from(trendMap.entries()).map(([date, counts]) => ({
      date,
      patients: counts.patients,
      reports: counts.reports
    }));

    return trendData || [];
  };

  const formatDateForInterval = (date: Date, interval: string): string => {
    if (interval === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (interval === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (interval === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
          trend={`${data.patientGrowth >= 0 ? '+' : ''}${data.patientGrowth.toFixed(1)}% from last month`}
          trendUp={data.patientGrowth > 0}
        />
        <DashboardCard 
          title="Notes to Review" 
          icon={<FileText className="h-6 w-6 text-yellow-500" />} 
          value={data.notesToReview}
          trend={`Pending review`}
          trendUp={false}
        />
        <DashboardCard 
          title="Reports Generated" 
          icon={<BarChart3 className="h-6 w-6 text-green-500" />} 
          value={data.monthlyReports}
          trend={`${data.reportGrowth >= 0 ? '+' : ''}${data.reportGrowth.toFixed(1)}% from last month`}
          trendUp={data.reportGrowth > 0}
        />
        <DashboardCard 
          title="Model Confidence" 
          icon={<Brain className="h-6 w-6 text-purple-500" />} 
          value={`${data.averageConfidence}%`}
          trend={data.averageConfidence >= 85 ? 'Above threshold' : 'Below threshold'}
          trendUp={data.averageConfidence >= 85}
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
  trendUp
}: { 
  title: string;
  icon: React.ReactNode;
  value: number | string;
  trend: string;
  trendUp: boolean;
}) => (
  <div className="bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
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