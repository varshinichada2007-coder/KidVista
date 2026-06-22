import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
  GraduationCap, Users, Camera, AlertCircle, BookOpen,
  Download, ChevronDown, CheckCircle, XCircle, Search,
  RefreshCw, TrendingUp, Image
} from 'lucide-react';

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ACTIVITY_COLORS = ['#4F9CF9', '#F59E0B', '#22C55E', '#8B5CF6', '#EF4444'];
const CLASS_COLORS = { Nursery: '#22C55E', LKG: '#4F9CF9', UKG: '#F59E0B' };

// â”€â”€ Beautiful Empty State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EmptyChart = ({ icon, title, subtitle, height = 180 }) => (
  <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '1rem' }}>
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
      {icon}
    </div>
    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8' }}>{title}</span>
    <span style={{ fontSize: '0.72rem', color: '#CBD5E1', textAlign: 'center', maxWidth: '200px' }}>{subtitle}</span>
  </div>
);

// SVG Bar Chart â€” with gradient bars and hover tooltips
const BarChart = ({ data, labelKey = 'date', valueKey = 'count', color = '#3B82F6', height = 180 }) => {
  const [tooltip, setTooltip] = useState(null);
  const total = (data || []).reduce((a, b) => a + (b[valueKey] || 0), 0);
  if (!data || data.length === 0 || total === 0) return <EmptyChart icon={<Camera size={20} style={{ color: '#94A3B8' }} />} title="No uploads yet" subtitle="Photos uploaded by teachers will appear here" height={height} />;

  const maxVal = Math.max(...data.map(d => d[valueKey] || 0), 5);
  const W = 420, H = height, padL = 36, padR = 8, padT = 10, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = Math.min(36, chartW / data.length - 8);
  const gap = (chartW - barW * data.length) / (data.length + 1);
  const gradId = `barGrad_${color.replace('#', '')}`;

  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {yTicks.map((v, i) => {
          const y = padT + chartH - (v / maxVal) * chartH;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#F1F5F9" strokeWidth="1" />
              <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="8" fill="#CBD5E1">{v}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const val = d[valueKey] || 0;
          const bH = Math.max((val / maxVal) * chartH, val > 0 ? 3 : 0);
          const x = padL + gap + i * (barW + gap);
          const y = padT + chartH - bH;
          const isHov = tooltip?.i === i;
          return (
            <g key={i}
              onMouseEnter={() => setTooltip({ i, x: x + barW / 2, y, val, label: d[labelKey] })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}>
              <rect x={x} y={padT + chartH} width={barW} height={0}
                fill={`url(#${gradId})`} rx="4">
                <animate attributeName="height" from="0" to={bH} dur="0.6s" fill="freeze" begin="0.1s" />
                <animate attributeName="y" from={padT + chartH} to={y} dur="0.6s" fill="freeze" begin="0.1s" />
              </rect>
              {isHov && <rect x={x - 2} y={y - 2} width={barW + 4} height={bH + 4} fill="none" stroke={color} strokeWidth="2" rx="5" opacity="0.4" />}
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="8" fill="#94A3B8" fontWeight="500">{d[labelKey]}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={padT + chartH} y2={padT + chartH} stroke="#E2E8F0" strokeWidth="1" />
        {tooltip && (
          <g>
            <rect x={tooltip.x - 28} y={tooltip.y - 28} width={56} height={22} rx="6" fill="#1E293B" />
            <text x={tooltip.x} y={tooltip.y - 13} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">{tooltip.val} upload{tooltip.val !== 1 ? 's' : ''}</text>
          </g>
        )}
      </svg>
    </div>
  );
};

// SVG Multi-line Chart
const MultiLineChart = ({ data, lines, xKey = 'week', height = 180 }) => {
  if (!data || data.length === 0) return <EmptyChart icon={<TrendingUp size={20} style={{ color: '#94A3B8' }} />} title="No attendance data" subtitle="Attendance records will be charted here as they're logged" height={height} />;

  const allVals = data.flatMap(d => lines.map(l => d[l.key] || 0));
  const allZero = allVals.every(v => v === 0);
  if (allZero) return <EmptyChart icon={<TrendingUp size={20} style={{ color: '#94A3B8' }} />} title="No attendance data" subtitle="Attendance records will appear here when available" height={height} />;

  const minVal = Math.max(Math.min(...allVals.filter(v => v > 0)) - 5, 0);
  const maxVal = Math.max(...allVals) + 5;
  const range = maxVal - minVal || 1;

  const W = 420, H = height, padL = 36, padR = 8, padT = 10, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xStep = chartW / Math.max(data.length - 1, 1);

  const getY = (val) => padT + chartH - ((val - minVal) / range) * chartH;
  const getX = (i) => padL + i * xStep;

  const yTicks = [minVal, Math.round(minVal + range * 0.5), maxVal];

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {yTicks.map((v, i) => {
        const y = getY(v);
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#F1F5F9" strokeWidth="1" />
            <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="8" fill="#CBD5E1">{v}%</text>
          </g>
        );
      })}
      {lines.map(({ key, color }) => {
        const pts = data.map((d, i) => `${getX(i)},${getY(d[key] || 0)}`).join(' ');
        return (
          <g key={key}>
            <polyline fill="none" stroke={color} strokeWidth="2.5" points={pts} strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
            {data.map((d, i) => (
              <circle key={i} cx={getX(i)} cy={getY(d[key] || 0)} r="4"
                fill="white" stroke={color} strokeWidth="2.5" />
            ))}
          </g>
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={getX(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="#94A3B8" fontWeight="500">{d[xKey]}</text>
      ))}
      <line x1={padL} x2={W - padR} y1={padT + chartH} y2={padT + chartH} stroke="#E2E8F0" strokeWidth="1" />
    </svg>
  );
};

// SVG Area Chart â€” with gradient fill and dot indicators
const AreaChart = ({ data, xKey = 'day', yKey = 'views', color = '#22C55E', height = 180 }) => {
  if (!data || data.length === 0) return <EmptyChart icon={<Users size={20} style={{ color: '#94A3B8' }} />} title="No engagement data" subtitle="Parent photo views will be tracked here" height={height} />;

  const vals = data.map(d => d[yKey] || 0);
  const maxVal = Math.max(...vals, 5);
  const allZero = vals.every(v => v === 0);
  if (allZero) return <EmptyChart icon={<Users size={20} style={{ color: '#94A3B8' }} />} title="No engagement yet" subtitle="Views will appear as parents browse photos" height={height} />;

  const W = 420, H = height, padL = 36, padR = 8, padT = 10, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;
  const getX = (i) => data.length === 1 ? padL + chartW / 2 : padL + i * xStep;
  const getY = (v) => padT + chartH - (v / maxVal) * chartH;

  const pts = data.map((d, i) => `${getX(i)},${getY(d[yKey] || 0)}`);
  const areaPath = data.length === 1
    ? '' // single point â€” skip area
    : `M ${getX(0)},${padT + chartH} L ${pts.join(' L ')} L ${getX(data.length - 1)},${padT + chartH} Z`;

  const gradId = `areaG_${color.replace('#', '')}`;
  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((v, i) => {
        const y = getY(v);
        return (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#F1F5F9" strokeWidth="1" />
            <text x={padL - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="8" fill="#CBD5E1">{v}</text>
          </g>
        );
      })}
      {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
      {data.length > 1 && <polyline fill="none" stroke={color} strokeWidth="2.5" points={pts.join(' ')} strokeLinejoin="round" strokeLinecap="round" />}
      {data.map((d, i) => {
        const val = d[yKey] || 0;
        if (val === 0) return null;
        return (
          <circle key={i} cx={getX(i)} cy={getY(val)} r="5"
            fill="white" stroke={color} strokeWidth="2.5" />
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={getX(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="#94A3B8" fontWeight="500">{d[xKey]}</text>
      ))}
      <line x1={padL} x2={W - padR} y1={padT + chartH} y2={padT + chartH} stroke="#E2E8F0" strokeWidth="1" />
    </svg>
  );
};

// SVG Donut Chart â€” with hover effects
const DonutChart = ({ data, labelKey = 'category', valueKey = 'count', colorKey = 'color' }) => {
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((a, b) => a + (b[valueKey] || 0), 0);
  if (total === 0) return <EmptyChart icon={<BookOpen size={20} style={{ color: '#94A3B8' }} />} title="No activities recorded" subtitle="Activity data will populate this chart as teachers add activities" height={160} />;

  const r = 35, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  let cum = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <svg width="140" height="140" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} stroke="#F1F5F9" strokeWidth="10" fill="none" />
        {data.map((d, i) => {
          const pct = (d[valueKey] || 0) / total;
          if (pct === 0) { return null; }
          const dash = pct * circ;
          const offset = -cum * circ;
          cum += pct;
          const col = d[colorKey] || ACTIVITY_COLORS[i % ACTIVITY_COLORS.length];
          const isHov = hovered === i;
          return (
            <circle key={i} cx={cx} cy={cy} r={r}
              stroke={col} strokeWidth={isHov ? 14 : 10} fill="none"
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-width 0.2s', cursor: 'pointer', filter: isHov ? 'brightness(1.1)' : 'none' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)} />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="5.5" fill="#94A3B8" fontWeight="500">TOTAL</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1E293B">{total}</text>
      </svg>
      <div className="adm-donut-legend">
        {data.filter(d => d[valueKey] > 0).map((d, i) => {
          const col = d[colorKey] || ACTIVITY_COLORS[i % ACTIVITY_COLORS.length];
          return (
            <div key={i} className="adm-legend-item"
              onMouseEnter={() => setHovered(data.indexOf(d))} onMouseLeave={() => setHovered(null)}>
              <span className="adm-legend-dot" style={{ background: col }} />
              <span style={{ fontWeight: hovered === data.indexOf(d) ? 700 : 400 }}>{d[labelKey]}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 700, color: col }}>{d[valueKey]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// SVG Pie Chart â€” colorful segments with values
const PieChart = ({ data, labelKey = 'className', valueKey = 'count', colorKey = 'color' }) => {
  const total = data.reduce((a, b) => a + (b[valueKey] || 0), 0);
  if (total === 0) return <EmptyChart icon={<GraduationCap size={20} style={{ color: '#94A3B8' }} />} title="No students enrolled" subtitle="Student data will appear once students are registered" height={140} />;

  const cx = 50, cy = 50, r = 20, circ = 2 * Math.PI * r;
  let cum = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <svg width="130" height="130" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} stroke="#F1F5F9" strokeWidth="40" fill="none" />
        {data.map((d, i) => {
          const pct = (d[valueKey] || 0) / total;
          if (pct === 0) { cum += pct; return null; }
          const dash = pct * circ;
          const offset = -cum * circ;
          const col = d[colorKey] || CLASS_COLORS[d[labelKey]] || ACTIVITY_COLORS[i];
          const midAngle = (cum + pct / 2) * 2 * Math.PI - Math.PI / 2;
          const lx = cx + r * Math.cos(midAngle);
          const ly = cy + r * Math.sin(midAngle);
          cum += pct;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r}
                stroke={col} strokeWidth="40" fill="none"
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${cx} ${cy})`} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fontSize="6.5" fill="white" fontWeight="700">{d[valueKey]}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {data.map((d, i) => {
          const col = d[colorKey] || CLASS_COLORS[d[labelKey]] || ACTIVITY_COLORS[i];
          const pct = total > 0 ? Math.round((d[valueKey] / total) * 100) : 0;
          return (
            <div key={i} className="adm-legend-item">
              <span className="adm-legend-dot" style={{ background: col }} />
              <span>{d[labelKey]}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 700, color: col }}>{d[valueKey]}</span>
              <span style={{ fontSize: '0.65rem', color: '#CBD5E1', marginLeft: '0.25rem' }}>({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Horizontal Bar Chart â€” with animated fill
const HBarChart = ({ data, nameKey = 'teacherName', valueKey = 'uploads', color = '#F59E0B' }) => {
  const total = data.reduce((a, b) => a + (b[valueKey] || 0), 0);
  if (!data || data.length === 0 || total === 0) return <EmptyChart icon={<GraduationCap size={20} style={{ color: '#94A3B8' }} />} title="No uploads yet" subtitle="Teacher photo uploads will be tracked here" height={140} />;

  const maxVal = Math.max(...data.map(d => d[valueKey] || 0), 5);
  const gradId = `hbarG_${color.replace('#', '')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {data.map((d, i) => {
        const pct = ((d[valueKey] || 0) / maxVal) * 100;
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 32px', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d[nameKey]}
            </span>
            <div style={{ height: '28px', background: '#F8FAFC', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                borderRadius: '6px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                minWidth: d[valueKey] > 0 ? '4px' : '0'
              }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: d[valueKey] > 0 ? '#1E293B' : '#CBD5E1', textAlign: 'right' }}>{d[valueKey]}</span>
          </div>
        );
      })}
    </div>
  );
};
// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [stats, setStats] = useState(null);
  const [parentRequests, setParentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week');
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { setActiveTab(getTabFromUrl()); }, [location.search]);

  const handleTabChange = (t) => navigate(`/admin?tab=${t}`);

  const fetchStats = async () => {
    try {
      const r = await API.get('/admin/stats');
      setStats(r.data);
    } catch { setError('Could not retrieve statistics.'); }
  };

  const fetchParentRequests = async () => {
    try {
      const r = await API.get('/admin/parent-requests');
      setParentRequests(r.data || []);
    } catch { /* silent */ }
  };

  const fetchAnalytics = useCallback(async (filter = timeFilter) => {
    setAnalyticsLoading(true);
    try {
      const r = await API.get(`/admin/analytics?filter=${filter}`);
      setAnalyticsData(r.data);
    } catch { /* silent */ }
    finally { setAnalyticsLoading(false); }
  }, [timeFilter]);

  const fetchAllUsers = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        API.get('/admin/teachers').catch(() => ({ data: [] })),
        API.get('/admin/parents').catch(() => ({ data: [] })),
      ]);
      const teachers = (tRes.data || []).map(t => ({
        name: t.name, role: 'Teacher', linkedTo: t.classroom_name || 'â€”',
        status: t.status || 'approved', email: t.email
      }));
      const parents = (pRes.data || []).map(p => ({
        name: p.name, role: 'Parent',
        linkedTo: (p.children && p.children[0]) ? p.children[0].student_name : 'â€”',
        status: p.status || 'approved', email: p.email
      }));
      setAllUsers([...teachers, ...parents]);
    } catch { /* silent */ }
  };

  const handleApproveParent = async (id) => {
    try {
      await API.put(`/admin/parent-requests/${id}/approve`);
      fetchStats(); fetchParentRequests(); fetchAnalytics();
    } catch { alert('Failed to approve.'); }
  };

  const handleRejectParent = async (id) => {
    if (!window.confirm('Reject this request?')) return;
    try {
      await API.put(`/admin/parent-requests/${id}/reject`);
      fetchStats(); fetchParentRequests();
    } catch { alert('Failed to reject.'); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchParentRequests(), fetchAnalytics('week'), fetchAllUsers()]);
      setLoading(false);
    };
    load();
  }, []);

  const handleFilterChange = (f) => {
    setTimeFilter(f);
    fetchAnalytics(f);
  };

  // â”€â”€ Chart Data â€” 100% dynamic, no fake fallbacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Daily uploads: convert ISO dates to day names
  const dailyUploads = (analyticsData?.dailyUploads || []).map(d => ({
    ...d,
    date: d.date && d.date.includes('-')
      ? DAY_NAMES_SHORT[new Date(d.date + 'T12:00:00').getDay()]
      : (d.date || '?')
  }));

  // Parent engagement: real data only, no padding
  const parentEngagement = (analyticsData?.parentEngagement || []).map(d => ({
    ...d,
    day: (d.day && !d.day.includes('-')) ? d.day
      : d.date ? DAY_NAMES_SHORT[new Date(d.date + 'T12:00:00').getDay()]
      : d.day || '?',
    views: d.views ?? d.score ?? 0
  }));

  // Activity distribution: real data, add colors
  const activityDistribution = (analyticsData?.activityDistribution || []).map((a, i) => ({
    ...a, color: a.color || ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]
  }));

  // Attendance trend: real data only
  const attendanceTrend = analyticsData?.attendanceTrend || [];

  // Teacher performance: real data
  const teacherPerformance = (analyticsData?.teacherPerformance || []).map(t => ({
    ...t,
    teacherName: t.teacherName || t.name,
    uploads: t.uploads ?? 0
  }));

  // Student distribution: real data
  const studentDistribution = (analyticsData?.studentDistribution || []).map(s => ({
    ...s, color: s.color || CLASS_COLORS[s.className] || '#4F9CF9'
  }));



  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.linkedTo?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'approvals', label: 'Approvals', badge: parentRequests.length || null },
    { key: 'users', label: 'Users' },
    { key: 'students', label: 'Students' },
    { key: 'classrooms', label: 'Classes' },
  ];

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: '1rem', color: '#94A3B8', fontFamily: 'Outfit, sans-serif' }}>
            <RefreshCw size={28} style={{ animation: 'adm-spin 1s linear infinite' }} />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="adm-content">

          {/* â”€â”€â”€ Page Header â”€â”€â”€ */}
          <div className="adm-page-header">
            <div>
              <h1 className="adm-page-title">Analytics dashboard</h1>
              <p className="adm-page-subtitle">Real-time view of your preschool community.</p>
            </div>
            <div className="adm-header-actions">
              <div className="adm-filter-group">
                {['today', 'week', 'month'].map(f => (
                  <button key={f} onClick={() => handleFilterChange(f)}
                    className={`adm-filter-btn ${timeFilter === f ? 'active' : ''}`}>
                    {f === 'week' ? 'This week' : f === 'month' ? 'This month' : 'Today'}
                  </button>
                ))}
              </div>
              <button className="adm-export-btn">
                <Download size={14} /> Export
              </button>
            </div>
          </div>



          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              OVERVIEW TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'overview' && (
            <>
              {/* 6 Stat Cards */}
              <div className="adm-stats-row">
                {[
                  { label: 'TOTAL STUDENTS', value: stats?.totalStudents ?? 0, sub: 'across 3 classes', icon: <GraduationCap size={18} />, bg: '#EFF6FF', color: '#3B82F6' },
                  { label: 'TOTAL PARENTS', value: stats?.totalParents ?? 0, sub: `${stats?.totalParents ?? 0} active`, icon: <Users size={18} />, bg: '#F0FDF4', color: '#22C55E' },
                  { label: 'TOTAL TEACHERS', value: stats?.totalTeachers ?? 0, sub: 'all active', icon: <GraduationCap size={18} />, bg: '#F0FDF4', color: '#22C55E' },
                  { label: 'PHOTOS UPLOADED', value: stats?.totalPhotos ?? 0, sub: `${analyticsData?.summary?.photosThisWeek ?? 0} this week`, icon: <Camera size={18} />, bg: '#EFF6FF', color: '#3B82F6' },
                  { label: 'PENDING APPROVALS', value: stats?.pendingPhotos ?? 0, sub: 'needs review', icon: <AlertCircle size={18} />, bg: '#FFFBEB', color: '#F59E0B', onClick: () => handleTabChange('approvals') },
                  { label: 'ACTIVE CLASSES', value: 3, sub: 'Nursery, LKG, UKG', icon: <BookOpen size={18} />, bg: '#F5F3FF', color: '#8B5CF6' },
                ].map((card, i) => (
                  <div key={i} className="adm-stat-card" onClick={card.onClick} style={{ cursor: card.onClick ? 'pointer' : 'default' }}>
                    <div className="adm-stat-icon" style={{ background: card.bg, color: card.color }}>
                      {card.icon}
                    </div>
                    <div className="adm-stat-info">
                      <span className="adm-stat-label">{card.label}</span>
                      <span className="adm-stat-value">{card.value}</span>
                      <span className="adm-stat-sub">{card.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row 1 */}
              <div className="adm-charts-row">
                <div className="adm-chart-card">
                  <div className="adm-chart-header">
                    <div>
                      <h3 className="adm-chart-title">Daily photo uploads</h3>
                      <p className="adm-chart-sub">Last 7 days â€” {dailyUploads.reduce((a, b) => a + (b.count || 0), 0)} total</p>
                    </div>
                    {analyticsLoading && <RefreshCw size={14} style={{ color: '#CBD5E1', animation: 'adm-spin 1s linear infinite' }} />}
                  </div>
                  <BarChart data={dailyUploads} labelKey="date" valueKey="count" color="#3B82F6" />
                </div>

                <div className="adm-chart-card">
                  <div className="adm-chart-header">
                    <div>
                      <h3 className="adm-chart-title">Activity distribution</h3>
                      <p className="adm-chart-sub">Categories this week</p>
                    </div>
                  </div>
                  <DonutChart data={activityDistribution} labelKey="category" valueKey="count" colorKey="color" />
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="adm-charts-row">
                <div className="adm-chart-card">
                  <div className="adm-chart-header">
                    <div>
                      <h3 className="adm-chart-title">Attendance trend</h3>
                      <p className="adm-chart-sub">By class, last 4 weeks</p>
                    </div>
                  </div>
                  <MultiLineChart
                    data={attendanceTrend} xKey="week"
                    lines={[
                      { key: 'nursery', color: '#3B82F6', label: 'Nursery' },
                      { key: 'lkg', color: '#F59E0B', label: 'LKG' },
                      { key: 'ukg', color: '#22C55E', label: 'UKG' },
                    ]}
                  />
                  <div className="adm-donut-legend" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                    {[{ label: 'nursery', color: '#3B82F6' }, { label: 'lkg', color: '#F59E0B' }, { label: 'ukg', color: '#22C55E' }].map(l => (
                      <div key={l.label} className="adm-legend-item">
                        <span className="adm-legend-dot" style={{ background: l.color }} />
                        <span>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-chart-card">
                  <div className="adm-chart-header">
                    <div>
                      <h3 className="adm-chart-title">Parent engagement</h3>
                      <p className="adm-chart-sub">Photo views per day</p>
                    </div>
                  </div>
                  <AreaChart data={parentEngagement} xKey="day" yKey="views" color="#22C55E" />
                </div>
              </div>

              {/* Charts Row 3 */}
              <div className="adm-charts-row">
                <div className="adm-chart-card">
                  <div className="adm-chart-header">
                    <div>
                      <h3 className="adm-chart-title">Teacher performance</h3>
                      <p className="adm-chart-sub">Total photo uploads (all time)</p>
                    </div>
                  </div>
                  {teacherPerformance.length > 0
                    ? <HBarChart data={teacherPerformance} nameKey="teacherName" valueKey="uploads" color="#F59E0B" />
                    : <div style={{ color: '#CBD5E1', fontSize: '0.8rem', padding: '1rem 0' }}>No teacher data</div>
                  }
                </div>

                <div className="adm-chart-card">
                  <div className="adm-chart-header">
                    <div>
                      <h3 className="adm-chart-title">Student distribution</h3>
                      <p className="adm-chart-sub">By class â€” {studentDistribution.reduce((a, b) => a + (b.count || 0), 0)} total</p>
                    </div>
                  </div>
                  <PieChart data={studentDistribution} labelKey="className" valueKey="count" colorKey="color" />
                </div>
              </div>
            </>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              ANALYTICS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'analytics' && (
            <>
              <div className="adm-info-card" style={{ marginBottom: '1.25rem' }}>
                <TrendingUp size={16} style={{ color: '#3B82F6', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                All charts are available here with{' '}
                <span style={{ color: '#3B82F6', fontWeight: 600 }}>daily / weekly / monthly</span> filters.
                Use the filter buttons above to change the time range.
              </div>

              <div className="adm-charts-row">
                <div className="adm-chart-card">
                  <div className="adm-chart-header"><div>
                    <h3 className="adm-chart-title">Daily photo uploads</h3>
                    <p className="adm-chart-sub">{dailyUploads.reduce((a, b) => a + (b.count || 0), 0)} photos â€” {timeFilter}</p>
                  </div></div>
                  <BarChart data={dailyUploads} labelKey="date" valueKey="count" color="#3B82F6" />
                </div>
                <div className="adm-chart-card">
                  <div className="adm-chart-header"><div>
                    <h3 className="adm-chart-title">Activity distribution</h3>
                    <p className="adm-chart-sub">All activities recorded</p>
                  </div></div>
                  <DonutChart data={activityDistribution} labelKey="category" valueKey="count" colorKey="color" />
                </div>
              </div>
              <div className="adm-charts-row">
                <div className="adm-chart-card">
                  <div className="adm-chart-header"><div>
                    <h3 className="adm-chart-title">Parent engagement</h3>
                    <p className="adm-chart-sub">Photo views per day</p>
                  </div></div>
                  <AreaChart data={parentEngagement} xKey="day" yKey="views" color="#22C55E" />
                </div>
                <div className="adm-chart-card">
                  <div className="adm-chart-header"><div>
                    <h3 className="adm-chart-title">Teacher performance</h3>
                    <p className="adm-chart-sub">Uploads this period</p>
                  </div></div>
                  <HBarChart data={teacherPerformance} nameKey="teacherName" valueKey="uploads" color="#F59E0B" />
                </div>
              </div>
            </>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              APPROVALS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'approvals' && (
            <>
              <div className="adm-panel">
                <h3 className="adm-panel-title">Pending approvals</h3>
                {parentRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                    <CheckCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                    <p>No pending approvals at this time.</p>
                  </div>
                ) : (
                  <div className="adm-approval-list">
                    {parentRequests.map(req => (
                      <div key={req.id} className="adm-approval-row">
                        <div className="adm-approval-avatar">{(req.name || 'U')[0].toUpperCase()}</div>
                        <div className="adm-approval-info">
                          <span className="adm-approval-name">{req.name}</span>
                          <span className="adm-approval-meta">
                            Parent Â· {req.childName || 'â€”'} Â· {new Date(req.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="adm-approval-actions">
                          <button className="adm-approve-btn" onClick={() => handleApproveParent(req.id)}>
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button className="adm-reject-btn" onClick={() => handleRejectParent(req.id)}>
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="adm-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 className="adm-panel-title" style={{ marginBottom: 0 }}>Photo approval queue</h3>
                  <span className="adm-badge-count">{stats?.pendingPhotos ?? 0} pending</span>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                  Go to{' '}
                  <button onClick={() => navigate('/admin/approvals')} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }}>
                    Photo Approvals
                  </button>{' '}
                  to review uploaded activity photos from teachers.
                </p>
                {stats?.pendingPhotos > 0 && (
                  <button className="adm-export-btn" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/admin/approvals')}>
                    <Image size={14} /> Review Photos
                  </button>
                )}
              </div>
            </>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              USERS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'users' && (
            <div className="adm-panel">
              <div className="adm-users-header">
                <h3 className="adm-panel-title" style={{ marginBottom: 0 }}>
                  All users <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: '0.875rem' }}>({allUsers.length})</span>
                </h3>
                <div className="adm-user-search">
                  <Search size={14} style={{ color: '#94A3B8' }} />
                  <input type="text" placeholder="Search users..." value={userSearch}
                    onChange={e => setUserSearch(e.target.value)} className="adm-user-search-input" />
                </div>
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>ROLE</th>
                      <th>LINKED TO</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: u.role === 'Teacher' ? '#EFF6FF' : '#F0FDF4', color: u.role === 'Teacher' ? '#3B82F6' : '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                              {(u.name || 'U')[0]}
                            </div>
                            <div>
                              <div className="adm-table-name">{u.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ background: u.role === 'Teacher' ? '#EFF6FF' : '#F0FDF4', color: u.role === 'Teacher' ? '#3B82F6' : '#22C55E', padding: '0.15rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.linkedTo}</td>
                        <td>
                          <span className={`adm-status-pill ${(u.status === 'approved' || u.status === 'active') ? 'active' : 'pending'}`}>
                            {(u.status === 'approved' || u.status === 'active') ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button className="adm-manage-btn" onClick={() => navigate(u.role === 'Teacher' ? '/admin/teachers' : '/admin/parents')}>
                            Manage
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                          {userSearch ? 'No users match your search.' : 'No users found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              STUDENTS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'students' && (
            <div className="adm-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 className="adm-panel-title" style={{ marginBottom: '0.25rem' }}>Students</h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0 }}>Enrolled students across all classes</p>
                </div>
                <button className="adm-export-btn" onClick={() => navigate('/admin/students')}>
                  Manage Students
                </button>
              </div>
              <div className="adm-charts-row" style={{ marginBottom: 0 }}>
                {studentDistribution.map((cls, i) => (
                  <div key={i} className="adm-class-card">
                    <div className="adm-class-icon" style={{ background: cls.color + '20', color: cls.color }}>
                      <BookOpen size={20} />
                    </div>
                    <h4 className="adm-class-name">{cls.className}</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{cls.count}</span>
                    <p className="adm-class-meta">enrolled students</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              CLASSES TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'classrooms' && (
            <div className="adm-panel">
              <h3 className="adm-panel-title">Active Classes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {['Nursery', 'LKG', 'UKG'].map((cls) => {
                  const dist = studentDistribution.find(s => s.className === cls);
                  const teacher = teacherPerformance.find(t => t.classroom === cls);
                  const col = CLASS_COLORS[cls];
                  return (
                    <div key={cls} className="adm-class-card" style={{ border: `1px solid ${col}20` }}>
                      <div className="adm-class-icon" style={{ background: col + '15', color: col }}>
                        <BookOpen size={20} />
                      </div>
                      <h4 className="adm-class-name">{cls}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ color: '#94A3B8' }}>Students</span>
                          <span style={{ fontWeight: 700, color: '#1E293B' }}>{dist?.count ?? 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ color: '#94A3B8' }}>Teacher</span>
                          <span style={{ fontWeight: 600, color: '#475569' }}>{teacher?.teacherName || 'â€”'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                          <span style={{ color: '#94A3B8' }}>Photos</span>
                          <span style={{ fontWeight: 600, color: '#475569' }}>{teacher?.uploads ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes adm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .adm-content {
          padding: 1.75rem 2rem 3rem;
          max-width: 1340px;
          width: 100%;
          font-family: 'Outfit', sans-serif;
        }

        /* â”€â”€ Page Header â”€â”€ */
        .adm-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .adm-page-title {
          font-size: 1.75rem; font-weight: 800;
          color: #0F172A; line-height: 1.2; margin: 0 0 0.2rem 0;
        }
        .adm-page-subtitle { font-size: 0.875rem; color: #64748B; margin: 0; }
        .adm-header-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

        .adm-filter-group { display: flex; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
        .adm-filter-btn {
          padding: 0.4rem 0.85rem; background: white; border: none;
          font-size: 0.8rem; font-weight: 500; color: #64748B; cursor: pointer;
          font-family: 'Outfit', sans-serif; border-right: 1px solid #E2E8F0; transition: all 0.15s;
        }
        .adm-filter-btn:last-child { border-right: none; }
        .adm-filter-btn:hover { background: #F8FAFC; color: #334155; }
        .adm-filter-btn.active { background: #2563EB; color: white; }

        .adm-export-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.45rem 1rem; background: #2563EB; color: white;
          border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; font-family: 'Outfit', sans-serif; transition: background 0.15s;
        }
        .adm-export-btn:hover { background: #1D4ED8; }

        /* â”€â”€ Tabs â”€â”€ */
        .adm-tabs-wrap {
          border: 1px solid #E2E8F0; border-bottom: none;
          border-radius: 10px 10px 0 0; background: white;
          margin-bottom: 0;
        }
        .adm-tabs { display: flex; gap: 0; padding: 0 1rem; }
        .adm-tab-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.8rem 1rem; background: transparent; border: none;
          border-bottom: 2px solid transparent; font-size: 0.875rem; font-weight: 500;
          color: #64748B; cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: all 0.15s; margin-bottom: -1px; white-space: nowrap;
        }
        .adm-tab-btn:hover { color: #1E293B; }
        .adm-tab-btn.active { color: #1E293B; font-weight: 700; border-bottom-color: #1E293B; }
        .adm-tab-badge {
          background: #3B82F6; color: white; font-size: 0.7rem; font-weight: 700;
          padding: 0.1rem 0.45rem; border-radius: 20px; min-width: 18px; text-align: center;
        }

        /* â”€â”€ Stat Cards â”€â”€ */
        .adm-stats-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.875rem;
          margin: 0 0 1.25rem 0;
          border: 1px solid #E2E8F0; border-top: none;
          border-radius: 0 0 10px 10px; background: white;
          padding: 1rem;
        }
        @media (max-width: 1200px) { .adm-stats-row { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .adm-stats-row { grid-template-columns: repeat(2, 1fr); } }
        .adm-stat-card {
          background: #FAFAFA; border: 1px solid #F1F5F9; border-radius: 10px;
          padding: 0.875rem 1rem; display: flex; flex-direction: column; gap: 0.5rem;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .adm-stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); transform: translateY(-1px); }
        .adm-stat-icon {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .adm-stat-info { display: flex; flex-direction: column; gap: 0.05rem; }
        .adm-stat-label { font-size: 0.62rem; font-weight: 700; color: #94A3B8; letter-spacing: 0.05em; text-transform: uppercase; }
        .adm-stat-value { font-size: 1.7rem; font-weight: 800; color: #0F172A; line-height: 1.2; }
        .adm-stat-sub { font-size: 0.72rem; color: #94A3B8; }

        /* â”€â”€ Chart Cards â”€â”€ */
        .adm-charts-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1.25rem; margin-bottom: 1.25rem;
        }
        @media (max-width: 900px) { .adm-charts-row { grid-template-columns: 1fr; } }
        .adm-chart-card {
          background: white; border: 1px solid #F1F5F9; border-radius: 12px;
          padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .adm-chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .adm-chart-title { font-size: 0.95rem; font-weight: 700; color: #1E293B; margin: 0 0 0.15rem 0; }
        .adm-chart-sub { font-size: 0.75rem; color: #94A3B8; margin: 0; }

        /* â”€â”€ Legend â”€â”€ */
        .adm-donut-legend { display: flex; flex-wrap: wrap; gap: 0.4rem 0.9rem; justify-content: center; }
        .adm-legend-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; color: #475569; }
        .adm-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* â”€â”€ Panels â”€â”€ */
        .adm-panel {
          background: white; border: 1px solid #F1F5F9; border-radius: 12px;
          padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 1.25rem;
        }
        .adm-panel-title { font-size: 1rem; font-weight: 700; color: #1E293B; margin: 0 0 1rem 0; }
        .adm-info-card {
          background: white; border: 1px solid #F1F5F9; border-radius: 12px;
          padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; color: #64748B;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04); font-size: 0.875rem;
        }

        /* â”€â”€ Approval List â”€â”€ */
        .adm-approval-list { display: flex; flex-direction: column; }
        .adm-approval-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.875rem 0; border-bottom: 1px solid #F8FAFC;
        }
        .adm-approval-row:last-child { border-bottom: none; }
        .adm-approval-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: #EFF6FF; color: #3B82F6;
          font-size: 0.875rem; font-weight: 700; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }
        .adm-approval-info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
        .adm-approval-name { font-size: 0.875rem; font-weight: 600; color: #1E293B; }
        .adm-approval-meta { font-size: 0.75rem; color: #94A3B8; }
        .adm-approval-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .adm-approve-btn {
          display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem;
          background: #22C55E; color: white; border: none; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; transition: background 0.15s;
        }
        .adm-approve-btn:hover { background: #16A34A; }
        .adm-reject-btn {
          display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.85rem;
          background: transparent; color: #64748B; border: 1.5px solid #E2E8F0;
          border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer;
          font-family: 'Outfit', sans-serif; transition: all 0.15s;
        }
        .adm-reject-btn:hover { border-color: #EF4444; color: #EF4444; }
        .adm-badge-count {
          background: #F1F5F9; color: #475569; font-size: 0.75rem; font-weight: 600;
          padding: 0.2rem 0.6rem; border-radius: 6px;
        }

        /* â”€â”€ Users Table â”€â”€ */
        .adm-users-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .adm-user-search {
          display: flex; align-items: center; gap: 0.5rem; border: 1px solid #E2E8F0;
          border-radius: 8px; padding: 0.4rem 0.75rem; background: #F8FAFC;
        }
        .adm-user-search-input {
          border: none; background: transparent; outline: none; font-size: 0.85rem;
          color: #475569; font-family: 'Outfit', sans-serif; width: 180px;
        }
        .adm-user-search-input::placeholder { color: #94A3B8; }
        .adm-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid #F1F5F9; }
        .adm-table { width: 100%; border-collapse: collapse; }
        .adm-table th {
          background: #F8FAFC; padding: 0.7rem 1rem; font-size: 0.68rem; font-weight: 700;
          color: #94A3B8; text-transform: uppercase; letter-spacing: 0.06em; text-align: left;
          border-bottom: 1px solid #F1F5F9;
        }
        .adm-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: #475569; border-bottom: 1px solid #F8FAFC; }
        .adm-table tr:last-child td { border-bottom: none; }
        .adm-table tr:hover td { background: #FAFAFA; }
        .adm-table-name { font-weight: 600; color: #1E293B !important; }
        .adm-status-pill {
          display: inline-flex; align-items: center; padding: 0.2rem 0.7rem;
          border-radius: 20px; font-size: 0.72rem; font-weight: 600;
        }
        .adm-status-pill.active { background: #DCFCE7; color: #16A34A; }
        .adm-status-pill.pending { background: #FEF3C7; color: #D97706; }
        .adm-manage-btn {
          background: transparent; border: none; color: #3B82F6; font-size: 0.875rem;
          font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif;
          padding: 0; transition: color 0.15s;
        }
        .adm-manage-btn:hover { color: #1D4ED8; }

        /* â”€â”€ Class Cards â”€â”€ */
        .adm-class-card {
          background: #FAFAFA; border: 1px solid #F1F5F9; border-radius: 12px;
          padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .adm-class-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .adm-class-icon {
          width: 40px; height: 40px; background: #EFF6FF; color: #3B82F6;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
        }
        .adm-class-name { font-size: 1rem; font-weight: 700; color: #1E293B; margin: 0; }
        .adm-class-meta { font-size: 0.8rem; color: #94A3B8; margin: 0; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
