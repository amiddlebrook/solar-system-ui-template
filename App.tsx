import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, BarChart3, BookOpen,
  Check, CheckCircle2, ChevronRight, CircleHelp, Clock3, Copy, Database,
  ExternalLink, FileDown, Filter, GitBranch, LayoutDashboard, Menu, Moon,
  Orbit, Pencil, Plus, RefreshCcw, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Sun, Trash2, X, Zap
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import './styles.css';

type Page = 'overview' | 'analytics' | 'records' | 'workflows' | 'settings' | 'docs';
type Status = 'Active' | 'Planning' | 'Review' | 'Done';
type Category = 'Product' | 'Operations' | 'Infrastructure' | 'Research';
type Item = { id: string; name: string; owner: string; category: Category; status: Status; date: string };
type Draft = Pick<Item, 'name' | 'owner' | 'category' | 'status'>;
type Preference = { light: boolean; compact: boolean };
type Validation = { time: string; passed: boolean; checks: { name: string; passed: boolean; detail: string }[] };

const RECORD_KEY = 'solar-ui-records-v2';
const PREF_KEY = 'solar-ui-preferences-v2';
const categories: Category[] = ['Product', 'Operations', 'Infrastructure', 'Research'];
const statuses: Status[] = ['Active', 'Planning', 'Review', 'Done'];
const palette = ['#7c8cff', '#63d9c4', '#f5bc6c', '#bd99f7'];
const demoItems: Item[] = [
  { id: 'SOL-1001', name: 'Customer portal refresh', owner: 'Alex Rivera', category: 'Product', status: 'Active', date: '2026-10-15' },
  { id: 'SOL-1002', name: 'Edge delivery pipeline', owner: 'Morgan Lee', category: 'Infrastructure', status: 'Review', date: '2026-10-14' },
  { id: 'SOL-1003', name: 'Quarterly insights report', owner: 'Taylor Brooks', category: 'Research', status: 'Done', date: '2026-10-13' },
  { id: 'SOL-1004', name: 'Onboarding improvements', owner: 'Jordan Kim', category: 'Product', status: 'Planning', date: '2026-10-12' },
  { id: 'SOL-1005', name: 'Incident response playbook', owner: 'Casey Stone', category: 'Operations', status: 'Active', date: '2026-10-11' },
  { id: 'SOL-1006', name: 'Component library audit', owner: 'Alex Rivera', category: 'Product', status: 'Done', date: '2026-10-10' },
  { id: 'SOL-1007', name: 'Quality gate automation', owner: 'Morgan Lee', category: 'Infrastructure', status: 'Review', date: '2026-10-08' },
  { id: 'SOL-1008', name: 'Data retention review', owner: 'Taylor Brooks', category: 'Operations', status: 'Planning', date: '2026-10-06' }
];
const blank: Draft = { name: '', owner: '', category: 'Product', status: 'Planning' };
const navigation = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'records', label: 'Records', icon: Database },
  { key: 'workflows', label: 'Workflows', icon: GitBranch },
  { key: 'settings', label: 'Controls', icon: SlidersHorizontal },
  { key: 'docs', label: 'Documentation', icon: BookOpen }
] as const;

function readItems(): Item[] {
  try {
    const raw = localStorage.getItem(RECORD_KEY);
    if (!raw) return demoItems;
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return demoItems;
    return value.filter((item): item is Item =>
      !!item && typeof item === 'object' &&
      typeof item.id === 'string' && typeof item.name === 'string' &&
      typeof item.owner === 'string' && typeof item.date === 'string' &&
      categories.includes(item.category) && statuses.includes(item.status)
    );
  } catch {
    return demoItems;
  }
}
function readPrefs(): Preference {
  try {
    const value = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    return { light: value.light === true, compact: value.compact === true };
  } catch {
    return { light: false, compact: false };
  }
}
function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
}
function formatDate(date: string) {
  const d = new Date(date + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function statusClass(status: Status) { return 'status status-' + status.toLowerCase(); }
function runValidation(items: Item[]): Validation {
  const unique = new Set(items.map(item => item.id));
  const checks = [
    { name: 'Record schema', passed: items.every(item => Boolean(item.id && item.name.trim() && item.owner.trim())), detail: 'Required fields are present' },
    { name: 'Unique identifiers', passed: unique.size === items.length, detail: unique.size + ' distinct record IDs' },
    { name: 'Status classification', passed: items.every(item => statuses.includes(item.status)), detail: 'Statuses match the allowed set' },
    { name: 'Local source accessible', passed: true, detail: items.length + ' records available in this browser' }
  ];
  return { time: new Date().toLocaleString(), passed: checks.every(check => check.passed), checks };
}

export default function App() {
  const [page, setPage] = useState<Page>('overview');
  const [records, setRecords] = useState<Item[]>(readItems);
  const [prefs, setPrefs] = useState<Preference>(readPrefs);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(blank);
  const [modalOpen, setModalOpen] = useState(false);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { try { localStorage.setItem(RECORD_KEY, JSON.stringify(records)); } catch { /* storage is optional */ } }, [records]);
  useEffect(() => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* storage is optional */ } }, [prefs]);

  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter(r => r.status === 'Active').length,
    done: records.filter(r => r.status === 'Done').length,
    review: records.filter(r => r.status === 'Review').length
  }), [records]);
  const categoryData = useMemo(() => categories.map((category, i) => ({
    name: category, value: records.filter(r => r.category === category).length, color: palette[i]
  })), [records]);
  const statusData = useMemo(() => statuses.map((status, i) => ({
    name: status, count: records.filter(r => r.status === status).length, color: palette[i]
  })), [records]);
  const filtered = useMemo(() => records.filter(row =>
    (statusFilter === 'All' || row.status === statusFilter) &&
    (categoryFilter === 'All' || row.category === categoryFilter) &&
    [row.name, row.owner, row.id, row.category].some(value => value.toLowerCase().includes(query.toLowerCase().trim()))
  ).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)), [records, statusFilter, categoryFilter, query]);
  const completion = stats.total ? Math.round(stats.done / stats.total * 100) : 0;
  const pageTitle = navigation.find(item => item.key === page)?.label || 'Overview';

  function navigate(next: Page) { setPage(next); setMobileOpen(false); setNotice(''); }
  function openNew() { setEditing(null); setDraft(blank); setModalOpen(true); }
  function openEdit(row: Item) { setEditing(row.id); setDraft({ name: row.name, owner: row.owner, category: row.category, status: row.status }); setModalOpen(true); }
  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.owner.trim()) return;
    if (editing) {
      setRecords(previous => previous.map(item => item.id === editing ? { ...item, ...draft, name: draft.name.trim(), owner: draft.owner.trim() } : item));
      setNotice('Record updated.');
    } else {
      const record: Item = { ...draft, name: draft.name.trim(), owner: draft.owner.trim(), id: 'SOL-' + Date.now().toString(36).toUpperCase(), date: new Date().toISOString().slice(0, 10) };
      setRecords(previous => [record, ...previous]);
      setNotice('Record created and saved locally.');
    }
    setModalOpen(false);
  }
  function removeRecord(row: Item) {
    if (!window.confirm('Delete "' + row.name + '" from this browser?')) return;
    setRecords(previous => previous.filter(item => item.id !== row.id));
    setNotice('Record deleted.');
  }
  function exportCsv() {
    const columns: (keyof Item)[] = ['id', 'name', 'owner', 'category', 'status', 'date'];
    const csv = [columns.join(','), ...filtered.map(row => columns.map(key => csvCell(row[key])).join(','))].join('\r\n');
    download('solar-ui-records.csv', csv, 'text/csv;charset=utf-8');
    setNotice('Exported ' + filtered.length + ' filtered records.');
  }
  function exportJson() {
    download('solar-ui-workspace.json', JSON.stringify({ exportedAt: new Date().toISOString(), records, preferences: prefs }, null, 2), 'application/json');
    setNotice('Workspace snapshot downloaded.');
  }
  function resetDemo() {
    if (!window.confirm('Replace your saved records with the original demo dataset? Export first if you need a backup.')) return;
    setRecords(demoItems);
    setValidation(null);
    setQuery(''); setStatusFilter('All'); setCategoryFilter('All');
    setNotice('Original demo data restored.');
  }
  async function copyCommand() {
    try {
      await navigator.clipboard.writeText('npm ci && npm run dev');
      setCopied(true);
      setNotice('Command copied.');
    } catch {
      setNotice('Clipboard unavailable. Copy the command from the code block.');
    }
  }
  const chartTooltip = { backgroundColor: prefs.light ? '#fff' : '#172034', border: '1px solid var(--border)', borderRadius: 12, color: prefs.light ? '#17243a' : '#f4f7ff' };

  return (
    <div className={['app', prefs.light ? 'light' : '', prefs.compact ? 'compact' : ''].join(' ')}>
      <a className="skip" href="#main">Skip to content</a>
      {mobileOpen && <button type="button" className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={'sidebar ' + (mobileOpen ? 'sidebar-open' : '')}>
        <div className="brand"><span className="brand-mark"><Orbit size={28} strokeWidth={1.8} /></span><div><strong>SOLAR<span>UI</span></strong><small>WORKSPACE / 02</small></div></div>
        <div className="sidebar-section-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation" className="nav">
          {navigation.map(entry => {
            const Icon = entry.icon;
            return <button type="button" key={entry.key} className={'nav-item ' + (page === entry.key ? 'selected' : '')} aria-current={page === entry.key ? 'page' : undefined} onClick={() => navigate(entry.key)}>
              <Icon size={18} strokeWidth={1.9}/><span>{entry.label}</span>{page === entry.key && <span className="nav-spot" />}
            </button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-info"><span className="pulse-dot"/><span>Local demo workspace</span><Check size={14}/></div>
          <div className="side-help"><Sparkles size={16}/><span>Zero-cost starter<br/><small>Cloudflare-ready React UI</small></span></div>
          <div className="side-footer">SOLAR SYSTEM <span>v2.0</span></div>
        </div>
      </aside>

      <div className="layout">
        <header className="topbar">
          <div className="topbar-left"><button type="button" className="icon-btn mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21}/></button>
            <span className="breadcrumb">Workspace</span><ChevronRight size={15} className="crumb-arrow"/><strong>{pageTitle}</strong></div>
          <div className="topbar-right"><span className="demo-badge"><span/> DEMO DATA</span><button type="button" className="icon-btn" title="Documentation" aria-label="Open documentation" onClick={() => navigate('docs')}><CircleHelp size={19}/></button>
            <button type="button" className="avatar" aria-label="Open preferences" title="Preferences" onClick={() => navigate('settings')}>S</button></div>
        </header>
        <main id="main" className="main" tabIndex={-1}>
          {notice && <div className="notice" role="status"><CheckCircle2 size={16}/><span>{notice}</span><button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16}/></button></div>}
          {page === 'overview' && <>
            <section className="welcome">
              <div><div className="eyebrow"><span className="eyebrow-line"/> COMMAND CENTER / OVERVIEW</div><h1>A clearer view of<br/><em>everything in orbit.</em></h1><p>One beautifully organized place to explore your workspace, track records, and test workflows.</p>
                <div className="welcome-actions"><button type="button" className="btn btn-primary" onClick={openNew}><Plus size={17}/> New record</button><button type="button" className="btn btn-outline" onClick={exportJson}><ArrowDownToLine size={17}/> Export snapshot</button></div>
              </div>
              <div className="welcome-visual" aria-hidden="true"><div className="planet-glow"/><div className="planet planet-one"/><div className="planet planet-two"/><div className="planet planet-three"/><div className="orbit-path orbit-a"/><div className="orbit-path orbit-b"/><div className="sun-core"><Orbit size={48} strokeWidth={1.25}/></div></div>
            </section>
            <div className="section-heading"><div><h2>Workspace pulse</h2><p>Live calculations from your browser's saved records</p></div><span className="section-meta"><Activity size={14}/> LOCAL STATE</span></div>
            <div className="kpi-grid">
              <MetricCard title="Total records" value={stats.total} icon={<Database size={18}/>} helper="Across all categories" color="violet"/>
              <MetricCard title="In progress" value={stats.active} icon={<Zap size={18}/>} helper="Currently active" color="blue"/>
              <MetricCard title="In review" value={stats.review} icon={<Clock3 size={18}/>} helper="Awaiting sign-off" color="amber"/>
              <MetricCard title="Completed" value={stats.done} icon={<CheckCircle2 size={18}/>} helper={completion + '% of total records'} color="green"/>
            </div>
            <div className="content-grid">
              <section className="panel chart-panel span-7"><PanelHead title="Status breakdown" subtitle="Where your records stand today" action={<button type="button" className="text-action" onClick={() => navigate('analytics')}>Explore analytics <ArrowUpRight size={15}/></button>}/>
                <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData} margin={{top:12,right:8,left:-22,bottom:0}}><CartesianGrid vertical={false} stroke="var(--grid)" strokeDasharray="3 6"/><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill:'var(--muted)',fontSize:12}}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{fill:'var(--muted)',fontSize:12}}/><Tooltip contentStyle={chartTooltip} cursor={{fill:'var(--hover)'}}/><Bar dataKey="count" radius={[7,7,0,0]} maxBarSize={56}>{statusData.map(entry => <Cell key={entry.name} fill={entry.color}/>)}</Bar></BarChart></ResponsiveContainer></div>
              </section>
              <section className="panel orbit-panel span-5"><PanelHead title="Navigation orbit" subtitle="Your modules, one click away"/><div className="module-orbit">
                <div className="orbit-ring ring-1"/><div className="orbit-ring ring-2"/><div className="orbit-center"><Orbit size={26}/><span>CORE</span></div>
                <button type="button" className="orbit-node orbit-node-1" aria-label="Open analytics" title="Analytics" onClick={() => navigate('analytics')}><BarChart3 size={19}/></button>
                <button type="button" className="orbit-node orbit-node-2" aria-label="Open records" title="Records" onClick={() => navigate('records')}><Database size={19}/></button>
                <button type="button" className="orbit-node orbit-node-3" aria-label="Open workflows" title="Workflows" onClick={() => navigate('workflows')}><GitBranch size={19}/></button>
                <button type="button" className="orbit-node orbit-node-4" aria-label="Open controls" title="Controls" onClick={() => navigate('settings')}><Settings2 size={19}/></button>
              </div><p className="orbit-caption">Select an orbiting node to jump between modules</p></section>
            </div>
            <div className="content-grid lower-grid">
              <section className="panel span-7"><PanelHead title="Recent records" subtitle="The latest updates in your workspace" action={<button type="button" className="text-action" onClick={() => navigate('records')}>View all <ArrowRight size={15}/></button>}/>
                <div className="recent-list">{records.length ? [...records].sort((a,b) => b.date.localeCompare(a.date)).slice(0,4).map((item, i) => <button type="button" className="recent-item" key={item.id} onClick={() => {navigate('records');setQuery(item.id);}}><span className={'recent-symbol symbol-'+(i%4)}>{item.name.charAt(0)}</span><span className="recent-copy"><strong>{item.name}</strong><small>{item.category} · {item.owner}</small></span><span className={statusClass(item.status)}>{item.status}</span><ChevronRight size={16} className="recent-arrow"/></button>) : <EmptyState label="No records yet. Create your first record to get started."/>}</div>
              </section>
              <section className="panel span-5 progress-panel"><PanelHead title="Completion rate" subtitle="Share of records marked done"/><div className="progress-content"><div className="progress-large">{completion}<small>%</small></div><div className="progress-track"><span style={{width:completion+'%'}}/></div><p>{stats.done} out of {stats.total} records completed</p><button type="button" className="text-action" onClick={() => navigate('workflows')}>Open workflow studio <ArrowRight size={15}/></button></div></section>
            </div>
          </>}

          {page === 'analytics' && <>
            <PageIntro eyebrow="INSIGHTS / ANALYTICS" title="Understand your workspace." subtitle="Data visualizations calculated from the same local records you can edit."/>
            <div className="kpi-grid three"><MetricCard title="Tracked records" value={stats.total} icon={<Database size={18}/>} helper="Current dataset" color="violet"/><MetricCard title="Completion rate" value={completion+'%'} icon={<CheckCircle2 size={18}/>} helper="Done / total" color="green"/><MetricCard title="Categories" value={categoryData.filter(row=>row.value>0).length} icon={<Filter size={18}/>} helper="With at least one record" color="blue"/></div>
            <div className="content-grid analytics-grid"><section className="panel span-7"><PanelHead title="Records by category" subtitle="Current distribution across your teams"/><div className="chart-box taller"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} layout="vertical" margin={{top:10,right:20,left:6,bottom:0}}><CartesianGrid horizontal={false} stroke="var(--grid)" strokeDasharray="3 6"/><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{fill:'var(--muted)',fontSize:12}}/><YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} tick={{fill:'var(--muted)',fontSize:12}}/><Tooltip contentStyle={chartTooltip} cursor={{fill:'var(--hover)'}}/><Bar dataKey="value" maxBarSize={34} radius={[0,6,6,0]}>{categoryData.map(entry=><Cell key={entry.name} fill={entry.color}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
            <section className="panel span-5"><PanelHead title="Status mix" subtitle="A quick look at your pipeline"/><div className="donut-box"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="count" nameKey="name" innerRadius={68} outerRadius={99} paddingAngle={4} stroke="none">{statusData.map(entry=><Cell key={entry.name} fill={entry.color}/>)}</Pie><Tooltip contentStyle={chartTooltip}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{stats.total}</strong><small>RECORDS</small></div></div><div className="legend">{statusData.map(row=><div key={row.name}><span style={{background:row.color}}/>{row.name}<strong>{row.count}</strong></div>)}</div></section></div>
            <section className="panel insight-panel"><div className="insight-icon"><Activity size={23}/></div><div><h3>A note about this data</h3><p>This is an interactive UI template, not a connected analytics service. All numbers come from sample records or changes saved in your browser. No hidden API calls, tracking pixels, or paid accounts.</p></div><button type="button" className="btn btn-outline" onClick={() => navigate('records')}>Manage data <ArrowRight size={16}/></button></section>
          </>}

          {page === 'records' && <>
            <PageIntro eyebrow="WORKSPACE / RECORDS" title="Everything, organized." subtitle="Search, filter, create, edit, delete, and export your local workspace data." action={<button type="button" className="btn btn-primary" onClick={openNew}><Plus size={17}/> New record</button>}/>
            <section className="panel record-panel"><div className="record-toolbar"><div className="search-box"><Search size={18}/><input aria-label="Search records" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search names, IDs, owners..." /></div><div className="toolbar-controls"><label className="filter-control"><Filter size={15}/><select aria-label="Filter by status" value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}><option>All</option>{statuses.map(status=><option key={status}>{status}</option>)}</select></label><label className="filter-control"><select aria-label="Filter by category" value={categoryFilter} onChange={event=>setCategoryFilter(event.target.value)}><option>All</option>{categories.map(category=><option key={category}>{category}</option>)}</select></label><button type="button" className="btn btn-outline export-btn" onClick={exportCsv}><FileDown size={17}/> Export CSV</button></div></div>
              <div className="table-scroll"><table><thead><tr><th>Record</th><th>Category</th><th>Owner</th><th>Status</th><th>Updated</th><th className="actions-col">Actions</th></tr></thead><tbody>{filtered.map(row=><tr key={row.id}><td><span className="row-name">{row.name}</span><small className="row-id">{row.id}</small></td><td>{row.category}</td><td>{row.owner}</td><td><span className={statusClass(row.status)}>{row.status}</span></td><td>{formatDate(row.date)}</td><td><div className="row-actions"><button type="button" aria-label={'Edit '+row.name} title="Edit" onClick={()=>openEdit(row)}><Pencil size={16}/></button><button type="button" aria-label={'Delete '+row.name} title="Delete" onClick={()=>removeRecord(row)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>{!filtered.length&&<EmptyState label="No records match your filters. Clear your search or create a new record."/>}</div>
              <div className="table-footer"><span>Showing {filtered.length} of {records.length} records</span><span>Saved in this browser · No server required</span></div></section>
          </>}

          {page === 'workflows' && <>
            <PageIntro eyebrow="AUTOMATION / WORKFLOWS" title="Build confidence into every run." subtitle="Explore a working, client-side record validation pipeline. No paid backend or fake deployment."/>
            <section className="pipeline"><div className="pipeline-step"><span className="step-icon"><Database size={21}/></span><span className="step-number">01</span><h3>Read data</h3><p>Load local records</p></div><span className="pipeline-arrow"><ArrowRight size={20}/></span><div className="pipeline-step"><span className="step-icon"><ShieldCheck size={21}/></span><span className="step-number">02</span><h3>Validate</h3><p>Check consistency</p></div><span className="pipeline-arrow"><ArrowRight size={20}/></span><div className="pipeline-step"><span className="step-icon"><CheckCircle2 size={21}/></span><span className="step-number">03</span><h3>Report</h3><p>Display results</p></div></section>
            <div className="content-grid"><section className="panel span-7 workflow-panel"><PanelHead title="Validation pipeline" subtitle="Execute meaningful checks on your current dataset"/><div className="workflow-description"><span className="mini-icon"><Zap size={19}/></span><div><strong>Local data quality scan</strong><p>Inspects required fields, unique IDs, status values, and dataset availability.</p></div></div><div className="workflow-row"><span>Records available</span><strong>{records.length}</strong></div><div className="workflow-row"><span>Execution mode</span><strong>Client-side · Free</strong></div><button type="button" className="btn btn-primary workflow-run" onClick={()=>{setValidation(runValidation(records));setNotice('Validation pipeline completed.');}}><Zap size={17}/> Run validation</button></section>
              <section className="panel span-5 results-panel"><PanelHead title="Run output" subtitle="Most recent local execution"/>{validation ? <><div className={'run-result '+(validation.passed?'pass':'fail')}>{validation.passed?<CheckCircle2 size={24}/>:<X size={24}/>}<div><strong>{validation.passed?'All checks passed':'Checks need attention'}</strong><small>{validation.time}</small></div></div><div className="check-list">{validation.checks.map(check=><div key={check.name}>{check.passed?<Check size={17}/>:<X size={17}/>}<span><strong>{check.name}</strong><small>{check.detail}</small></span></div>)}</div></> : <div className="empty-run"><Activity size={33}/><strong>No runs yet</strong><p>Run the validation pipeline to see real results from your local records.</p></div>}</section></div>
          </>}

          {page === 'settings' && <>
            <PageIntro eyebrow="SYSTEM / CONTROLS" title="Make the workspace yours." subtitle="Customize your interface and manage your local demo dataset."/>
            <div className="settings-stack"><section className="panel settings-panel"><PanelHead title="Appearance" subtitle="Preferences are saved in this browser"/><div className="setting-row"><span className="setting-icon">{prefs.light?<Sun size={21}/>:<Moon size={21}/>}</span><div><strong>Light appearance</strong><p>Switch between midnight and daylight themes</p></div><button type="button" className={'switch '+(prefs.light?'on':'')} role="switch" aria-checked={prefs.light} aria-label="Light appearance" onClick={()=>setPrefs(current=>({...current,light:!current.light}))}><span/></button></div><div className="setting-row"><span className="setting-icon"><Settings2 size={21}/></span><div><strong>Compact layout</strong><p>Reduce spacing for information-dense screens</p></div><button type="button" className={'switch '+(prefs.compact?'on':'')} role="switch" aria-checked={prefs.compact} aria-label="Compact layout" onClick={()=>setPrefs(current=>({...current,compact:!current.compact}))}><span/></button></div></section>
            <section className="panel settings-panel"><PanelHead title="Data & portability" subtitle="Everything runs locally without an account"/><div className="setting-row"><span className="setting-icon"><ArrowDownToLine size={21}/></span><div><strong>Download workspace</strong><p>Export your complete dataset and preferences as JSON</p></div><button type="button" className="btn btn-outline" onClick={exportJson}>Export JSON</button></div><div className="setting-row"><span className="setting-icon"><RefreshCcw size={21}/></span><div><strong>Restore demo data</strong><p>Replace local changes with the original example records</p></div><button type="button" className="btn btn-outline" onClick={resetDemo}>Reset records</button></div></section></div>
          </>}

          {page === 'docs' && <>
            <PageIntro eyebrow="GUIDE / DOCUMENTATION" title="An excellent starting point." subtitle="Designed to deploy as static assets on Cloudflare Workers, using GitHub Actions."/>
            <div className="docs-grid"><section className="panel doc-card"><span className="doc-icon"><Zap size={22}/></span><h3>Run it locally</h3><p>Install Node.js 22 or newer, clone the repository, and start Vite.</p><div className="code-snippet"><code>npm ci &amp;&amp; npm run dev</code><button type="button" aria-label="Copy command" title="Copy" onClick={copyCommand}>{copied?<Check size={16}/>:<Copy size={16}/>}</button></div></section>
              <section className="panel doc-card"><span className="doc-icon"><Orbit size={22}/></span><h3>Deploy to Cloudflare</h3><p>GitHub Actions builds and publishes static assets when Cloudflare credentials are configured. No paid service required for normal free-tier usage.</p><a href="https://developers.cloudflare.com/workers/static-assets/" target="_blank" rel="noopener noreferrer" className="text-action">Cloudflare guide <ExternalLink size={15}/></a></section>
              <section className="panel doc-card"><span className="doc-icon"><Database size={22}/></span><h3>Understand the demo</h3><p>Records, filters, charts, and validation are functional. Data is kept in localStorage, not synchronized across users or devices.</p><button type="button" className="text-action" onClick={()=>navigate('records')}>Try the record manager <ArrowRight size={15}/></button></section>
              <section className="panel doc-card"><span className="doc-icon"><ShieldCheck size={22}/></span><h3>Free by design</h3><p>No API keys in browser bundles, no external font or CSS CDN, and no dependency on proprietary analytics. Static assets are served from Cloudflare's edge.</p><a href="https://github.com/amiddlebrook/solar-system-ui-template" target="_blank" rel="noopener noreferrer" className="text-action">View source <ExternalLink size={15}/></a></section></div>
          </>}
          <footer className="main-footer"><span>© {new Date().getFullYear()} SOLAR UI · Demo template</span><span><span className="footer-dot"/> Browser-local · Cloudflare-ready</span></footer>
        </main>
      </div>

      {modalOpen && <div className="modal-scrim" onMouseDown={event=>{if(event.target===event.currentTarget)setModalOpen(false);}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><small>WORKSPACE / RECORDS</small><h2 id="modal-title">{editing?'Edit record':'Create new record'}</h2></div><button type="button" className="icon-btn" aria-label="Close form" onClick={()=>setModalOpen(false)}><X size={20}/></button></div><form onSubmit={saveRecord}><label>Record name<input autoFocus required maxLength={100} value={draft.name} onChange={event=>setDraft(current=>({...current,name:event.target.value}))} placeholder="e.g. Release readiness review"/></label><label>Owner<input required maxLength={70} value={draft.owner} onChange={event=>setDraft(current=>({...current,owner:event.target.value}))} placeholder="e.g. Jordan Lee"/></label><div className="form-grid"><label>Category<select value={draft.category} onChange={event=>setDraft(current=>({...current,category:event.target.value as Category}))}>{categories.map(category=><option key={category}>{category}</option>)}</select></label><label>Status<select value={draft.status} onChange={event=>setDraft(current=>({...current,status:event.target.value as Status}))}>{statuses.map(status=><option key={status}>{status}</option>)}</select></label></div><div className="modal-actions"><button type="button" className="btn btn-outline" onClick={()=>setModalOpen(false)}>Cancel</button><button type="submit" className="btn btn-primary"><Check size={17}/>{editing?'Save changes':'Create record'}</button></div></form></section></div>}
    </div>
  );
}

function MetricCard({title,value,helper,icon,color}:{title:string;value:string|number;helper:string;icon:ReactNode;color:string}) {
  return <div className="metric-card"><div className="metric-top"><span>{title}</span><span className={'metric-icon metric-'+color}>{icon}</span></div><strong>{value}</strong><div className="metric-help">{helper}</div></div>;
}
function PanelHead({title,subtitle,action}:{title:string;subtitle:string;action?:ReactNode}) {
  return <div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div>{action}</div>;
}
function PageIntro({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle:string;action?:ReactNode}) {
  return <div className="page-intro"><div><div className="eyebrow"><span className="eyebrow-line"/>{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}
function EmptyState({label}:{label:string}) {
  return <div className="empty-state"><Database size={28}/><p>{label}</p></div>;
}
