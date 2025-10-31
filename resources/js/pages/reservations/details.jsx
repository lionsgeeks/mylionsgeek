import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Package, Users, Hash, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

function normalizeImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('/storage/')) return imagePath;
  if (imagePath.startsWith('storage/')) return `/${imagePath}`;
  if (imagePath.startsWith('img/')) return `/storage/${imagePath}`;
  return `/storage/${imagePath}`;
}

function getStatusBadge(res) {
  if (res.canceled) {
    return <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-red-100 text-red-800 border-red-200"><XCircle className="w-4 h-4"/>Canceled</span>;
  }
  if (res.approved) {
    return <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-4 h-4"/>Approved</span>;
  }
  return <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-amber-100 text-amber-800 border-amber-200"><AlertCircle className="w-4 h-4"/>Pending</span>;
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
}

export default function ReservationDetailsPage({ reservation }) {
  if (!reservation) return <div className="p-8 text-center">Reservation not found.</div>;
  return (
    <AppLayout>
      <Head title={`Reservation Details - #${reservation.id}`} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link href="/reservations"><button className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">⟵ All Reservations</button></Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reservation Details</h1>
              <p className="text-gray-600">Reservation #{reservation.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(reservation)}
            <span className="text-sm text-gray-500">Created {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : ''}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Reservation Info */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Reservation Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{reservation.title || 'Untitled Reservation'}</h3>
                    <p className="text-gray-600 mb-4">{reservation.description || 'No description available.'}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{reservation.type || 'No type'}</Badge>
                      {reservation.approved && <Badge className="text-xs bg-green-100 text-green-800">Approved</Badge>}
                      {reservation.canceled && <Badge variant="destructive" className="text-xs">Canceled</Badge>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Hash className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">ID: #{reservation.id}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">Date: {reservation.date || 'N/A'}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-600">Time: {reservation.start} - {reservation.end}</span></div>
                    {reservation.studio_name && (
                      <div className="flex items-center gap-2"><Badge className="text-xs bg-blue-100 text-blue-800">Studio: {reservation.studio_name}</Badge></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Info */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" />Equipment ({reservation.equipments?.length || 0} items)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {reservation.equipments && reservation.equipments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reservation.equipments.map((equipment, index) => (
                      <div key={equipment.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow flex gap-4 items-center">
                        {equipment.image ? (
                          <img src={normalizeImageUrl(equipment.image)} alt={equipment.reference || equipment.mark} className="w-16 h-16 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center"><Package className="w-6 h-6 text-gray-400" /></div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{equipment.mark}</div>
                          <div className="text-xs text-gray-500">{equipment.reference}</div>
                          <div className="text-xs text-gray-400 italic">{equipment.type_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8"><Package className="w-12 h-12 text-gray-400 mx-auto mb-2" /><p className="text-gray-600">No equipment assigned</p></div>
                )}
              </CardContent>
            </Card>

            {/* Timing Info */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50"><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Timing</CardTitle></CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-8 flex-wrap">
                  <div><span className="font-semibold">Date:</span> {reservation.date || '—'}</div>
                  <div><span className="font-semibold">Start:</span> {reservation.start || '—'}</div>
                  <div><span className="font-semibold">End:</span> {reservation.end || '—'}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Who reserved */}
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50"><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Reserved By</CardTitle></CardHeader>
              <CardContent className="p-6 text-center">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarImage src={normalizeImageUrl(reservation.user_avatar)} alt={reservation.user_name} className="w-16 h-16 rounded-full object-cover border" />
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-lg font-semibold w-16 h-16 flex items-center justify-center rounded-full">
                    {getInitials(reservation.user_name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{reservation.user_name || 'Unknown User'}</h3>
                {reservation.user_email && <div className="text-sm text-gray-500">{reservation.user_email}</div>}
              </CardContent>
            </Card>

            {/* Team Members */}
            {reservation.team_members && reservation.team_members.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50"><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Team Members <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{reservation.team_members.length}</span></CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {reservation.team_members.map((member, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={normalizeImageUrl(member.image)} alt={member.name} className="w-12 h-12 rounded-full object-cover border" />
                          <AvatarFallback className="bg-blue-100 text-blue-800 text-sm font-semibold w-12 h-12 flex items-center justify-center rounded-full">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
