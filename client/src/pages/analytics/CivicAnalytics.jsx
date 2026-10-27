import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Building2,
  Calendar
} from 'lucide-react';

export default function CivicAnalytics() {
  const [metrics, setMetrics] = useState({
    totalComplaints: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
    criticalPriority: 0,
    slaBreached: 0,
    escalatedCount: 0,
    resolutionRate: '0%',
    slaCompliance: '100%',
  });

  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [categoriesChart, setCategoriesChart] = useState([]);
  const [workloadMatrix, setWorkloadMatrix] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [metricsRes, analyticsRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/analytics'),
        ]);

        if (metricsRes.data.success) {
          setMetrics(metricsRes.data.metrics);
        }
        if (analyticsRes.data.success) {
          setTimeSeriesData(analyticsRes.data.timeSeriesData || []);
          setCategoriesChart(analyticsRes.data.categoriesChart || []);
          setWorkloadMatrix(analyticsRes.data.workloadMatrix || []);
        }
      } catch (err) {
        console.error('Failed to load civic analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-md">
            Civic Analytics & Intelligence
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2 tracking-tight">
            City-Wide Civic Grievance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time municipal performance monitoring, complaint volume forecasting, and SLA compliance metrics.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Interval: Daily (Last 7 Days)</span>
        </div>
      </div>

      {/* Top 8 KPI Cards (Figure 5.5 in Report) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Volume</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{metrics.totalComplaints}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-sky-600 uppercase">Open Cases</span>
          <div className="text-xl font-bold text-sky-600 mt-1">{metrics.openComplaints}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase">Resolved</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{metrics.resolvedComplaints}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-rose-600 uppercase">Critical</span>
          <div className="text-xl font-bold text-rose-600 mt-1">{metrics.criticalPriority}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-red-600 uppercase">SLA Breached</span>
          <div className="text-xl font-bold text-red-600 mt-1">{metrics.slaBreached}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-purple-600 uppercase">Escalated</span>
          <div className="text-xl font-bold text-purple-600 mt-1">{metrics.escalatedCount}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-brand-600 uppercase">Resolution Rate</span>
          <div className="text-xl font-bold text-brand-600 mt-1">{metrics.resolutionRate}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-semibold text-teal-600 uppercase">SLA Compliance</span>
          <div className="text-xl font-bold text-teal-600 mt-1">{metrics.slaCompliance}</div>
        </div>
      </div>

      {/* Grid: Charts Section (Figure 5.5 in Report) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Complaint Volume Time-Series Trend */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                Complaint Volume Time-Series Trend
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daily Critical, Resolved, and Total Volume distribution
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+100% Volume</span>
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Volume"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  name="Critical Priority"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCritical)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Top Main Categories Bar Chart (Figure 5.5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
              Top Main Categories
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Distribution by primary municipal taxonomy
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoriesChart}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Grievances" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Performance and Workload Matrix (Figure 5.5) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase">
            Department Performance & Workload Matrix
          </h3>
          <p className="text-[11px] text-slate-500">
            Workload breakdown, resolution speed, and SLA compliance by department
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Total Received</th>
                <th className="py-3 px-4 text-center">Active Open</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">SLA Breached</th>
                <th className="py-3 px-4 text-center">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {workloadMatrix.map((dept, index) => (
                <tr key={index} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-800 flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>{dept.name}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold">{dept.total}</td>
                  <td className="py-3 px-4 text-center font-semibold text-sky-600">{dept.open}</td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-600">{dept.resolved}</td>
                  <td className="py-3 px-4 text-center font-semibold text-rose-600">{dept.breached}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      dept.compliancePct >= 90
                        ? 'bg-emerald-100 text-emerald-800'
                        : dept.compliancePct >= 70
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {dept.compliancePct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
