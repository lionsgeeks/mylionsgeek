import React from 'react';
import { usePage } from '@inertiajs/react';
import ReservationTable from '@/components/ReservationTable';
import AppLayout from '@/layouts/app-layout';

export default function ReservationSpacesPage() {
  const { reservations = [] } = usePage().props;
  const parseTs = (s) => {
    if (!s || typeof s !== 'string') return 0;
    const isoish = s.includes('T') ? s : s.replace(' ', 'T');
    const t = Date.parse(isoish);
    return Number.isFinite(t) ? t : 0;
  };
  const sortedReservations = [...reservations].sort((a, b) => parseTs(b.created_at) - parseTs(a.created_at));
  const columns = [
    { key: "user_name", label: "User" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time", render: r => `${r.start} - ${r.end}` },
    { key: "type", label: "Type", render: r => (r.type || r.place_type)?.replace('_', ' ') ?? "—" },
    { key: "status", label: "Status", render: r => (
      r.canceled ? <span className="text-red-600">Canceled</span> :
      <>{r.approved ? <span className="text-green-700">Approved</span> : <span className="text-yellow-700">Pending</span>}</>) },
  ];
  const breadcrumbs = [
    { title: 'My Reservations', href: '/reservations/spaces' }
  ];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">My Reservations</h1>
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <ReservationTable columns={columns} data={sortedReservations} />
        </div>
      </div>
    </AppLayout>
  );
}



