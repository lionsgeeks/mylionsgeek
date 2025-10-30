import React from 'react';
import { usePage } from '@inertiajs/react';

// Placeholder imports for icons/components
// import { Chart, Card, Widget, UserAvatar } from '@/components';

// You can swap in real version or MUI/Antd icons as desired
const PlaceholderIcon = () => <span className="inline-block w-6 h-6 bg-gray-200 rounded-full" />;

const StatCard = ({ title, value, icon, color }) => (
  <div className={"flex flex-col bg-white/80 border shadow rounded-2xl p-4 min-w-[160px] " + color}>
    <div className="flex items-center gap-2 mb-2 text-3xl font-bold">{icon}<span>{value}</span></div>
    <div className="text-gray-700 text-sm">{title}</div>
  </div>
);

export default function MainDashboard() {
  // All these must be filled by your Inertia backend:
  const {
    leaderboardWeek = [],              // [{name, img, count}]
    leaderboardAllTime = [],           // [{name, img, count}]
    studioMostReserved = {},           // {name, count}
    studioMostReservedWeek = {},       // {name, count}
    lastComputerDamage = {},           // {user, date, model, problem}
    lastEquipmentDamages = [],         // [{item, user, date, desc}]
    lastReservations = [],             // [{user, studio, date, status}]
    reservationTrend = [],             // [{date, count}]
    totalStats = {},                   // {totalUsers, totalStudios, totalReservations, totalEquipment, damagedEquipment, ...}
    outOfOrderStudios = [],            // [{name, id, desc}]
    outOfOrderEquipment = [],          // [{name, id, desc}]
  } = usePage().props;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
      {/* Stats widgets */}
      <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard title="Users" value={totalStats.totalUsers} icon={<PlaceholderIcon />} color="text-blue-600" />
        <StatCard title="Studios" value={totalStats.totalStudios} icon={<PlaceholderIcon />} color="text-fuchsia-700" />
        <StatCard title="Reservations" value={totalStats.totalReservations} icon={<PlaceholderIcon />} color="text-emerald-700" />
        <StatCard title="Equipments" value={totalStats.totalEquipment} icon={<PlaceholderIcon />} color="text-yellow-600" />
        <StatCard title="Damaged" value={totalStats.damagedEquipment} icon={<PlaceholderIcon />} color="text-red-600" />
      </div>

      {/* Left column: Leaderboards, Top Studios  */}
      <div className="space-y-6">
        {/* Leaderboard This Week */}
        <div className="bg-white/80 rounded-xl shadow p-4">
          <div className="font-bold mb-2 text-lg text-gray-900">🏆 Top Users This Week</div>
          <ul>
            {leaderboardWeek.map((u, i) => (
              <li key={u.name} className="flex items-center gap-2 mb-1">
                <img src={u.img} alt="avatar" className="w-8 h-8 rounded-full border" />
                <span className="font-semibold">{u.name}</span>
                <span className="ml-auto text-sm text-blue-700 font-bold">{u.count}x</span>
                {i === 0 && <span className="ml-2 bg-yellow-100 text-yellow-900 px-2 py-0.5 rounded">#1</span>}
              </li>
            ))}
          </ul>
        </div>
        {/* Leaderboard All Time */}
        <div className="bg-white/80 rounded-xl shadow p-4">
          <div className="font-bold mb-2 text-lg text-gray-900">🏅 Top All-Time</div>
          <ul>
            {leaderboardAllTime.map(u => (
              <li key={u.name} className="flex items-center gap-2 mb-1">
                <img src={u.img} alt="avatar" className="w-8 h-8 rounded-full border" />
                <span className="font-semibold">{u.name}</span>
                <span className="ml-auto text-sm text-emerald-700 font-bold">{u.count}x</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Most Reserved Studios */}
        <div className="bg-white/80 rounded-xl shadow p-4">
          <div className="font-bold mb-2 text-lg text-gray-900">🎤 Most Reserved Studio</div>
          <div>{studioMostReserved.name} <span className="ml-2 text-blue-700">({studioMostReserved.count}x)</span></div>
        </div>
        <div className="bg-white/80 rounded-xl shadow p-4">
          <div className="font-bold mb-2 text-lg text-gray-900">🎤 Most Reserved This Week</div>
          <div>{studioMostReservedWeek.name} <span className="ml-2 text-blue-700">({studioMostReservedWeek.count}x)</span></div>
        </div>
      </div>

      {/* Middle column: Recent Damage/Reservations, Out-of-Order */}
      <div className="space-y-6">
        {/* Latest Reservations */}
        <div className="bg-white/80 rounded-xl shadow p-4">
          <div className="font-bold mb-2 text-lg text-gray-900">📝 Last 5 Reservations</div>
          <ul>
            {lastReservations.map((res,idx) => (
              <li key={idx} className="flex items-center gap-2 mb-1 text-sm">
                <span className="font-semibold text-black/80">{res.user}</span> reserved <span className="font-semibold">{res.studio}</span> on <span>{res.date}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Last Computer Damage */}
        <div className="bg-white/80 rounded-xl shadow p-4">
          <div className="font-bold mb-2 text-lg text-red-800">💻 Last Computer Damage</div>
          <div>{lastComputerDamage.user} reported <b>{lastComputerDamage.model}</b> on {lastComputerDamage.date}</div>
          <div className="text-sm text-gray-500 italic">{lastComputerDamage.problem}</div>
        </div>
        {/* Last Equipment Damages */}
        <div className="bg-white/80 rounded-xl shadow p-4">
          <div className="font-bold mb-2 text-lg text-red-700">🔧 Latest Equipment Damaged</div>
          <ul>
            {lastEquipmentDamages.map((e,idx) => (
              <li key={idx} className="text-sm mb-1">{e.user} - {e.item} ({e.date}) <span className="italic text-gray-500">{e.desc}</span></li>
            ))}
          </ul>
        </div>
        {/* Out-of-Order Studios/Equipment */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-3">
          <div className="font-bold text-yellow-600 mb-1">⚠️ Currently Out Of Order</div>
          <ul className="mb-1">
            {outOfOrderStudios.map(s=> (<li key={s.id} className="text-yellow-900">Studio: <b>{s.name}</b> <span className="italic">{s.desc}</span></li>))}
            {outOfOrderEquipment.map(e=> (<li key={e.id} className="text-yellow-900">Equip: <b>{e.name}</b> <span className="italic">{e.desc}</span></li>))}
          </ul>
        </div>
      </div>
      {/* Right column: Reservation Trend */}
      <div className="bg-white/80 rounded-xl shadow p-4 flex flex-col min-h-[300px]">
        <div className="font-bold mb-2 text-lg text-gray-900">📈 Reservation Trend</div>
        {/* Simple trend chart placeholder, swap for Recharts/Chartjs, etc. */}
        <div className="text-gray-400 italic text-sm">[Chart goes here, use reservationTrend prop]</div>
        <ul className="mt-2 text-xs text-gray-500">
          {reservationTrend.map((pt,idx) => (
            <li key={idx}>{pt.date}: {pt.count}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}