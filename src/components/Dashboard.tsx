import React, { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, Brain } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [notesToReview, setNotesToReview] = useState(0);
  const [monthlyReports, setMonthlyReports] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [nerCoverage, setNerCoverage] = useState(0);
  const [avgRiskFactors, setAvgRiskFactors] = useState(0);
  const [cancerDistribution, setCancerDistribution] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Total Patients
      const { count: patientTotal } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      setPatientCount(patientTotal || 0);

      // 2. Notes to Review
      const { count: pendingNotes } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setNotesToReview(pendingNotes || 0);

      // 3. Monthly Reports
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());
      setMonthlyReports(reportsCount || 0);

      // 4. Average Model Confidence
      const { data: confidenceData } = await supabase
        .from('reports')
        .select('confidence');
      if (confidenceData && confidenceData.length) {
        const avg =
          confidenceData.reduce((sum, r) => sum + r.confidence, 0) /
          confidenceData.length;
        setAverageConfidence(Math.round(avg * 100));
      }

      // 5. NER Coverage
      const { data: metrics } = await supabase
        .from('model_metrics')
        .select('ner_coverage')
        .order('last_updated', { ascending: false })
        .limit(1);
      if (metrics && metrics.length) {
        setNerCoverage(Math.round(metrics[0].ner_coverage * 100));
      }

      // 6. Average Risk Factors Found
      const { data: riskData } = await supabase.rpc('get_avg_risk_factors');
      setAvgRiskFactors(riskData || 0);

      // 7. Cancer Type Distribution
      const { data: distribution } = await supabase
        .from('reports')
        .select('predicted_type');
      const distMap = {};
      if (distribution) {
        distribution.forEach(({ predicted_type }) => {
          distMap[predicted_type] = (distMap[predicted_type] || 0) + 1;
        });
      }
      setCancerDistribution(distMap);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Total Patients" icon={<Users className="h-6 w-6 text-blue-500" />} value={patientCount} />
        <DashboardCard title="Notes to Review" icon={<FileText className="h-6 w-6 text-yellow-500" />} value={notesToReview} />
        <DashboardCard title="Reports Generated" icon={<BarChart3 className="h-6 w-6 text-blue-500" />} value={monthlyReports} />
        <DashboardCard title="High Confidence" icon={<Brain className="h-6 w-6 text-green-500" />} value={`${averageConfidence}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCircle title="Model Confidence" value={averageConfidence} color="green" />
        <MetricCircle title="NER Coverage" value={nerCoverage} color="blue" />
        <MetricCircle title="Risk Factors Found" value={avgRiskFactors} suffix="avg" color="yellow" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Cancer Type Distribution</h3>
        <div className="h-80 flex items-end justify-around px-4">
          {Object.entries(cancerDistribution).map(([type, count], idx) => {
            const percent = (count / Object.values(cancerDistribution).reduce((a, b) => a + b, 0)) * 100;
            return (
              <div key={idx} className="flex flex-col items-center w-1/5">
                <div className={`bg-blue-500 w-full rounded-t-lg`} style={{ height: `calc(${percent}% * 280px / 100)` }}></div>
                <p className="mt-2 text-sm text-gray-600 text-center">{type}</p>
                <p className="text-xs font-semibold text-gray-500">{percent.toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, icon, value }: { title: string; icon: React.ReactNode; value: number | string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      {icon}
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const MetricCircle = ({ title, value, suffix = '%', color }: { title: string; value: number; suffix?: string; color: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-gray-700 mb-4">{title}</h3>
    <div className="flex items-center justify-center">
      <div className="relative w-32 h-32">
        <div className="w-full h-full rounded-full border-8 border-gray-200">
          <div
            className={`absolute top-0 left-0 w-full h-full rounded-full border-8 border-${color}-500`}
            style={{
              clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)',
              transform: `rotate(${(value / 100) * 360}deg)`
            }}
          ></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-500">{suffix}</div>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
