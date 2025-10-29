import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CalendarDays,
    CheckCircle,
    Clock,
    FileText,
    Hash,
    Mail,
    MapPin,
    Package,
    Phone,
    Timer,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';

export default function AdminReservationDetails({ reservation }) {
    if (!reservation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">Reservation not found</h3>
                        <p className="mb-4 text-gray-600">The requested reservation could not be found.</p>
                        <Link href="/admin/reservations">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to reservations
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getStatusBadge = () => {
        if (reservation.canceled) {
            return (
                <span
                    className={`inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800`}
                >
                    <XCircle className="h-4 w-4" />
                    Canceled
                </span>
            );
        }
        if (reservation.approved) {
            return (
                <span
                    className={`inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800`}
                >
                    <CheckCircle className="h-4 w-4" />
                    Approved
                </span>
            );
        }
        return (
            <span
                className={`inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800`}
            >
                <AlertCircle className="h-4 w-4" />
                Pending
            </span>
        );
    };

    const formatTime = (dateTime) => {
        if (!dateTime) return 'Not specified';
        return new Date(dateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return 'Not specified';
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffMs = endTime - startTime;
        const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
        return `${diffHours} hours`;
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const normalizeImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        if (imagePath.startsWith('/storage/')) {
            return imagePath;
        }
        if (imagePath.startsWith('storage/')) {
            return `/${imagePath}`;
        }
        if (imagePath.startsWith('img/')) {
            return `/storage/${imagePath}`;
        }
        return `/storage/${imagePath}`;
    };

    const isPending = !reservation.canceled && !reservation.approved;

    const handleApprove = () => {
        router.post(`/admin/reservations/${reservation.id}/approve`);
    };

    const handleCancel = () => {
        router.post(`/admin/reservations/${reservation.id}/cancel`);
    };

    return (
        <AppLayout>
            <Head title={`Reservation Details - #${reservation.id}`} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-4">
                        <Link href="/admin/reservations">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to reservations
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reservation Details</h1>
                            <p className="text-gray-600">Reservation #{reservation.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {getStatusBadge()}
                        <span className="text-sm text-gray-500">Created {new Date(reservation.created_at).toLocaleDateString()}</span>
                        {isPending && (
                            <div className="ml-auto flex items-center gap-2">
                                <Button onClick={handleApprove} className="bg-green-600 text-white hover:bg-green-700" size="sm">
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Approve
                                </Button>
                                <Button onClick={handleCancel} variant="destructive" size="sm">
                                    <XCircle className="mr-1 h-4 w-4" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Reservation Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-2 text-xl font-semibold text-gray-900">{reservation.title || 'Untitled Reservation'}</h3>
                                        <p className="mb-4 text-gray-600">{reservation.description || 'No description available.'}</p>
                                        <div className="mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {reservation.type || 'No type'}
                                            </Badge>
                                            {reservation.approved && (
                                                <Badge variant="default" className="bg-green-100 text-xs text-green-800">
                                                    Approved
                                                </Badge>
                                            )}
                                            {reservation.canceled && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Canceled
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">ID: #{reservation.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                Created: {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        {reservation.approver_name && (
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-green-600">Approved by: {reservation.approver_name}</span>
                                            </div>
                                        )}
                                        {reservation.start_signed && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-green-600">Start Signed</span>
                                            </div>
                                        )}
                                        {reservation.end_signed && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-green-600">End Signed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Equipment Information ({reservation.equipments?.length || 0} items)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {reservation.equipments && reservation.equipments.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {reservation.equipments.map((equipment, index) => (
                                            <div key={equipment.id || index} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {equipment.image ? (
                                                            <img
                                                                src={normalizeImageUrl(equipment.image)}
                                                                alt={equipment.name}
                                                                className="h-16 w-16 rounded-lg border object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-gray-100">
                                                                <Package className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate text-sm font-semibold text-gray-900">{equipment.name}</h4>
                                                        {equipment.type_name && (
                                                            <div className="mt-2 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">{equipment.type_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Package className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                        <p className="text-gray-600">No equipment assigned to this reservation</p>
                                    </div>
                                )}

                                {reservation.studio_name && (
                                    <div className="mt-4 border-t pt-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Building2 className="h-4 w-4" />
                                            <span>Studio: {reservation.studio_name}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Timing Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Start Time</span>
                                            </div>
                                            <p className="font-medium text-gray-900">{formatTime(reservation.start_time)}</p>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">End Time</span>
                                            </div>
                                            <p className="font-medium text-gray-900">{formatTime(reservation.end_time)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Duration</span>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                {calculateDuration(reservation.start_time, reservation.end_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Reservation Date</span>
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                {reservation.day
                                                    ? new Date(reservation.day).toLocaleDateString('en-US', {
                                                          weekday: 'long',
                                                          year: 'numeric',
                                                          month: 'long',
                                                          day: 'numeric',
                                                      })
                                                    : 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Status</span>
                                            </div>
                                            {getStatusBadge()}
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Hash className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Reservation ID</span>
                                            </div>
                                            <p className="font-mono font-medium text-gray-900">#{reservation.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {reservation.notes && (
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Notes & Comments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="whitespace-pre-wrap text-gray-700">{reservation.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Reserved By
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <Avatar className="mx-auto mb-4 h-16 w-16">
                                        <AvatarImage src={normalizeImageUrl(reservation.user_avatar)} />
                                        <AvatarFallback className="bg-blue-100 text-lg font-semibold text-blue-800">
                                            {getInitials(reservation.user_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{reservation.user_name || 'Unknown User'}</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {reservation.user_email && (
                                            <div className="flex items-center justify-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <span>{reservation.user_email}</span>
                                            </div>
                                        )}
                                        {reservation.user_phone && (
                                            <div className="flex items-center justify-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                <span>{reservation.user_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {reservation.members && reservation.members.length > 0 && (
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Team Members
                                        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">{reservation.members.length}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {reservation.members.map((member, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                                            >
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={normalizeImageUrl(member.avatar)} />
                                                    <AvatarFallback className="bg-blue-100 text-sm font-semibold text-blue-800">
                                                        {getInitials(member.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm font-medium text-gray-900">{member.name}</p>
                                                        {member.role && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {member.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-xs text-gray-500">{member.email}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <UserCheck className="h-4 w-4 text-green-600" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <Link href="/admin/reservations" className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back to reservations
                                        </Button>
                                    </Link>
                                    {reservation.status === 'upcoming' && (
                                        <Button variant="destructive" className="w-full justify-start">
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancel Reservation
                                        </Button>
                                    )}
                                    {reservation.status === 'active' && (
                                        <Button variant="default" className="w-full justify-start">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            End Reservation
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
