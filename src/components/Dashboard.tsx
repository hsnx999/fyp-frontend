import React, { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [notesToReview, setNotesToReview] = useState(0);
  const [monthlyReports, setMonthlyReports] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [nerCoverage, setNerCoverage] = useState(0);
  const [avgRiskFactors, setAvgRiskFactors] = useState(0);
  const [cancerDistribution, setCancerDistribution] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel for better performance
        const [
          patientResult,
          notesResult,
          reportsResult,
          confidenceResult,
          metricsResult,
          riskData,
          distributionResult
        ] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('notes').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('reports').select('*', { count: 'exact' }).gte('created_at', new Date(new Date().setDate(1)).toISOString()),
          supabase.from('reports').select('confidence'),
          supabase.from('model_metrics').select('ner_coverage').order('last_updated', { ascending: false }).limit(1),
          supabase.rpc('get_avg_risk_factors'),
          supabase.from('reports').select('predicted_type')
        ]);

        setPatientCount(patientResult.count || 0);
        setNotesToReview(notesResult.count || 0);
        setMonthlyReports(reportsResult.count || 0);

        if (confidenceResult.data?.length) {
          const avg = confidenceResult.data.reduce((sum, r) => sum + r.confidence, 0) / confidenceResult.data.length;
          setAverageConfidence(Math.round(avg * 100));
        }

        if (metricsResult.data?.length) {
          setNerCoverage(Math.round(metricsResult.data[0].ner_coverage * 100));
        }

        setAvgRiskFactors(riskData.data || 0);

        if (distributionResult.data) {
          const distMap = {};
          distributionResult.data.forEach(({ predicted_type }) => {
            distMap[predicted_type] = (distMap[predicted_type] || 0) + 1;
          });
          setCancerDistribution(distMap);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCircle 
          title="AI Model Performance" 
          value={averageConfidence} 
          color="purple"
          icon={<Brain className="h-5 w-5" />}
        />
        <MetricCircle 
          title="NER Coverage" 
          value={nerCoverage} 
          color="blue"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <MetricCircle 
          title="Risk Factors" 
          value={avgRiskFactors} 
          suffix="avg" 
          color="yellow"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancer Type Distribution</h3>
          <div className="h-80 flex items-end justify-around px-4">
            {Object.entries(cancerDistribution).map(([type, count], idx) => {
              const total = Object.values(cancerDistribution).reduce((a: any, b) => a + b, 0);
              const percent = (count as number / total) * 100;
              return (
                <div key={idx} className="flex flex-col items-center w-1/5">
                  <div 
                    className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90"
                    style={{ 
                      height: `${percent}%`,
                      backgroundColor: `hsl(${idx * 50}, 70%, 60%)`,
                    }}
                  ></div>
                  <p className="mt-2 text-sm font-medium text-gray-700">{type}</p>
                  <p className="text-xs text-gray-500">{percent.toFixed(1)}%</p>
                </div>
              );
            })}
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

const MetricCircle = ({ 
  title, 
  value, 
  suffix = '%', 
  color,
  icon
}: { 
  title: string;
  value: number;
  suffix?: string;
  color: string;
  icon: React.ReactNode;
}) => {
  const radius = 40;
  const circumference = radius * 2 * Math.PI;
  const progress = value / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const colorClasses = {
    purple: 'text-purple-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className={colorClasses[color]}>{icon}</span>
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`text-${color}-500 transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{suffix}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;