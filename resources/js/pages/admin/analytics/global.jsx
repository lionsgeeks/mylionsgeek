import React, { useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

function downloadCSV(filename, rows) {
  const csvContent = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).map(v => typeof v === 'string' && v.includes(',') ? `"${v.replaceAll('"','""')}"` : v ?? '').join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

export default function GlobalAnalytics({ totals = {}, latest_reservations = [], computers = [], equipment = [], absent_today = [], absent_week = [], absent_month = [], most_absent = [], projects_new = [], today }) {
  const equipmentByState = useMemo(() => {
    const ok = equipment.filter(e => e.state).length;
    const bad = equipment.length - ok;
    return [{ name: 'Functional', value: ok }, { name: 'Non-Functional', value: bad }];
  }, [equipment]);

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <AppLayout>
      <Head title="Global Analytics" />
      <div className="px-4 py-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Global Statistics & Reporting</h1>
          <p className="text-muted-foreground">Today: {today}</p>
        </div>

        {/* Topline cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Users', value: totals.users },
            { label: 'Reservations', value: totals.reservations },
            { label: 'Computers', value: totals.computers },
            { label: 'Equipment', value: totals.equipment },
            { label: 'Projects', value: totals.projects },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-sidebar-border/70 bg-card p-4">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <div className="text-2xl font-bold">{c.value ?? 0}</div>
            </div>
          ))}
        </div>

        {/* Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Absent Today</h2>
              {absent_today.length > 0 && (
                <button onClick={() => downloadCSV('absent_today.csv', absent_today)} className="text-xs px-3 py-1 rounded border hover:bg-muted">
                  Export CSV
                </button>
              )}
            </div>
            {absent_today.length === 0 ? (
              <div className="text-muted-foreground">No absences recorded today.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="py-1 pr-3">Name</th>
                      <th className="py-1 pr-3">Email</th>
                      <th className="py-1 pr-3">Morning</th>
                      <th className="py-1 pr-3">Lunch</th>
                      <th className="py-1 pr-3">Evening</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absent_today.slice(0, 20).map(u => (
                      <tr key={`${u.id}-${u.day}`} className="border-t border-sidebar-border/70">
                        <td className="py-1 pr-3 whitespace-nowrap">{u.name}</td>
                        <td className="py-1 pr-3 whitespace-nowrap text-muted-foreground">{u.email || '—'}</td>
                        <td className="py-1 pr-3">{u.absent_morning ? 'Absent' : 'Present'}</td>
                        <td className="py-1 pr-3">{u.absent_lunch ? 'Absent' : 'Present'}</td>
                        <td className="py-1 pr-3">{u.absent_evening ? 'Absent' : 'Present'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Absent (This Week)</h2>
              {absent_week.length > 0 && (
                <button onClick={() => downloadCSV('absent_week.csv', absent_week)} className="text-xs px-3 py-1 rounded border hover:bg-muted">Export CSV</button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={absent_week}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="absences" fill="#f59e0b" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            {absent_week.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1 pr-3">Name</th>
                      <th className="py-1 pr-3">Days absent</th>
                      <th className="py-1 pr-3">Morning</th>
                      <th className="py-1 pr-3">Lunch</th>
                      <th className="py-1 pr-3">Evening</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absent_week.map(r => (
                      <tr key={r.user_id} className="border-t border-sidebar-border/70">
                        <td className="py-1 pr-3">{r.name}</td>
                        <td className="py-1 pr-3">{r.absences}</td>
                        <td className="py-1 pr-3">{r.am}</td>
                        <td className="py-1 pr-3">{r.noon}</td>
                        <td className="py-1 pr-3">{r.pm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Absent (This Month)</h2>
              {absent_month.length > 0 && (
                <button onClick={() => downloadCSV('absent_month.csv', absent_month)} className="text-xs px-3 py-1 rounded border hover:bg-muted">Export CSV</button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={absent_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="absences" fill="#ef4444" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            {absent_month.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1 pr-3">Name</th>
                      <th className="py-1 pr-3">Days absent</th>
                      <th className="py-1 pr-3">Morning</th>
                      <th className="py-1 pr-3">Lunch</th>
                      <th className="py-1 pr-3">Evening</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absent_month.map(r => (
                      <tr key={r.user_id} className="border-t border-sidebar-border/70">
                        <td className="py-1 pr-3">{r.name}</td>
                        <td className="py-1 pr-3">{r.absences}</td>
                        <td className="py-1 pr-3">{r.am}</td>
                        <td className="py-1 pr-3">{r.noon}</td>
                        <td className="py-1 pr-3">{r.pm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Most Absent</h2>
              {most_absent.length > 0 && (
                <button onClick={() => downloadCSV('most_absent.csv', most_absent)} className="text-xs px-3 py-1 rounded border hover:bg-muted">Export CSV</button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={most_absent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="absences" fill="#ef4444" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reservations / Equipment / Computers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Latest Reservations</h2>
              {latest_reservations.length > 0 && (
                <button onClick={() => downloadCSV('latest_reservations.csv', latest_reservations)} className="text-xs px-3 py-1 rounded border hover:bg-muted">Export CSV</button>
              )}
            </div>
            <div className="space-y-2 text-sm">
              {latest_reservations.map(r => (
                <div key={r.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title || `Reservation #${r.id}`}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.date} {r.start} - {r.end} · {r.type} · {r.user_name}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${r.canceled ? 'bg-red-500/15 text-red-600' : r.approved ? 'bg-green-500/15 text-green-700' : 'bg-amber-500/15 text-amber-700'}`}>{r.canceled ? 'Canceled' : r.approved ? 'Approved' : 'Pending'}</span>
                </div>
              ))}
              {latest_reservations.length === 0 && <div className="text-muted-foreground">No reservations yet.</div>}
            </div>
          </div>

          <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Equipment State</h2>
              {equipment.length > 0 && (
                <button onClick={() => downloadCSV('equipment.csv', equipment)} className="text-xs px-3 py-1 rounded border hover:bg-muted">Export CSV</button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={equipmentByState} dataKey="value" nameKey="name" label>
                  {equipmentByState.map((e, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-xs text-muted-foreground">In reservation today: {equipment.filter(e => e.in_reservation_today).length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Computers & Assignment</h2>
              {computers.length > 0 && (
                <button onClick={() => downloadCSV('computers.csv', computers)} className="text-xs px-3 py-1 rounded border hover:bg-muted">Export CSV</button>
              )}
            </div>
            <div className="space-y-2 text-sm">
              {computers.map(c => (
                <div key={c.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{c.reference || `PC #${c.id}`}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.mark}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${c.state ? 'bg-green-500/15 text-green-700' : 'bg-red-500/15 text-red-600'}`}>{c.state ? 'Available' : 'Busy'}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">{c.user_name || '—'}</span>
                  </div>
                </div>
              ))}
              {computers.length === 0 && <div className="text-muted-foreground">No computers.</div>}
            </div>
          </div>

          <div className="rounded-xl border border-sidebar-border/70 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">New Projects</h2>
              {projects_new.length > 0 && (
                <button onClick={() => downloadCSV('projects_new.csv', projects_new)} className="text-xs px-3 py-1 rounded border hover:bg-muted">Export CSV</button>
              )}
            </div>
            <ul className="text-sm space-y-2">
              {projects_new.map(p => (
                <li key={p.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <span className="truncate">{p.name}</span>
                  <span className="text-muted-foreground text-xs">{p.created_at}</span>
                </li>
              ))}
              {projects_new.length === 0 && <div className="text-muted-foreground">No new projects.</div>}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button onClick={() => window.print()} className="px-4 py-2 rounded border hover:bg-muted">Export PDF (Print)</button>
        </div>
      </div>
    </AppLayout>
  );
}


