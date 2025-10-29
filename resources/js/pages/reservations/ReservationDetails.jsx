import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    Package,
    Users,
    MapPin,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Timer,
    Image as ImageIcon,
    Building2,
    Hash,
    CalendarDays,
    UserCheck,
    Settings
} from 'lucide-react';

export default function ReservationDetails({ reservation }) {
    if (!reservation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Reservation not found</h3>
                        <p className="text-gray-600 mb-4">The requested reservation could not be found.</p>
                        <Link href="/reservations">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to History
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getStatusBadge = () => {
        // Mirror admin index logic: Canceled > Approved > Pending
        if (reservation.canceled) {
            return (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-red-100 text-red-800 border-red-200`}>
                    <XCircle className="w-4 h-4" />
                    Canceled
                </span>
            );
        }
        if (reservation.approved) {
            return (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200`}>
                    <CheckCircle className="w-4 h-4" />
                    Approved
                </span>
            );
        }
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-amber-100 text-amber-800 border-amber-200`}>
                <AlertCircle className="w-4 h-4" />
                Pending
            </span>
        );
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'Not specified';
        return new Date(dateTime).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (dateTime) => {
        if (!dateTime) return 'Not specified';
        return new Date(dateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return 'Not specified';
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffMs = endTime - startTime;
        const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
        return `${diffHours} hours`;
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const normalizeImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // If it already starts with /storage, return as is
        if (imagePath.startsWith('/storage/')) {
            return imagePath;
        }

        // If it starts with storage/, add leading /
        if (imagePath.startsWith('storage/')) {
            return `/${imagePath}`;
        }

        // If it starts with img/, add /storage/ prefix
        if (imagePath.startsWith('img/')) {
            return `/storage/${imagePath}`;
        }

        // Default: add /storage/img/profile/ for user avatars or /storage/img/equipment/ for equipment
        return `/storage/${imagePath}`;
    };

    return (
        <AppLayout>
            <Head title={`Reservation Details - #${reservation.id}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin/reservations">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
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
                        <span className="text-sm text-gray-500">
                            Created {new Date(reservation.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Reservation Information */}
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Reservation Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {reservation.title || 'Untitled Reservation'}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {reservation.description || 'No description available.'}
                                        </p>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs">
                                                {reservation.type || 'No type'}
                                            </Badge>
                                            {reservation.approved && (
                                                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
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
                                            <Hash className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">ID: #{reservation.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600">Created: {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        {reservation.approver_name && (
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-600">Approved by: {reservation.approver_name}</span>
                                            </div>
                                        )}
                                        {reservation.start_signed && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-600">Start Signed</span>
                                            </div>
                                        )}
                                        {reservation.end_signed && (
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-600">End Signed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Equipment Information */}
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Equipment Information ({reservation.equipments?.length || 0} items)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {reservation.equipments && reservation.equipments.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {reservation.equipments.map((equipment, index) => (
                                            <div key={equipment.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                    {equipment.image ? (
                                                        <img
                                                            src={normalizeImageUrl(equipment.image)}
                                                            alt={equipment.name}
                                                            className="w-16 h-16 object-cover rounded-lg border"
                                                        />
                                                    ) : (
                                                            <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                            {equipment.name}
                                                        </h4>

                                                        {equipment.type_name && (
                                                            <div className="flex items-center gap-1 mt-2">
                                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">{equipment.type_name}</span>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600">No equipment assigned to this reservation</p>
                                    </div>
                                )}

                                {reservation.studio_name && (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Building2 className="w-4 h-4" />
                                            <span>Studio: {reservation.studio_name}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timing Information */}
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Timing Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Start Time</span>
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {formatTime(reservation.start_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">End Time</span>
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {formatTime(reservation.end_time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Timer className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Duration</span>
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {calculateDuration(reservation.start_time, reservation.end_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarDays className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Reservation Date</span>
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {reservation.day ? new Date(reservation.day).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Status</span>
                                            </div>
                                            {getStatusBadge()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Hash className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Reservation ID</span>
                                            </div>
                                            <p className="text-gray-900 font-medium font-mono">
                                                #{reservation.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes/Comments */}
                        {reservation.notes && (
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Notes & Comments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{reservation.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Reservation User */}
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Reserved By
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <Avatar className="w-16 h-16 mx-auto mb-4">
                                        <AvatarImage src={normalizeImageUrl(reservation.user_avatar)} />
                                        <AvatarFallback className="bg-blue-100 text-blue-800 text-lg font-semibold">
                                            {getInitials(reservation.user_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {reservation.user_name || 'Unknown User'}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        {reservation.user_email && (
                                            <div className="flex items-center justify-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <span>{reservation.user_email}</span>
                                            </div>
                                        )}
                                        {reservation.user_phone && (
                                            <div className="flex items-center justify-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <span>{reservation.user_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team Members */}
                        {reservation.members && reservation.members.length > 0 && (
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Team Members
                                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                            {reservation.members.length}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {reservation.members.map((member, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarImage src={normalizeImageUrl(member.avatar)} />
                                                    <AvatarFallback className="bg-blue-100 text-blue-800 text-sm font-semibold">
                                                        {getInitials(member.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {member.name}
                                                        </p>
                                                        {member.role && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {member.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <UserCheck className="w-4 h-4 text-green-600" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <Link href="/admin/reservations" className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to reservations
                                        </Button>
                                    </Link>
                                    {reservation.status === 'upcoming' && (
                                        <Button variant="destructive" className="w-full justify-start">
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Cancel Reservation
                                        </Button>
                                    )}
                                    {reservation.status === 'active' && (
                                        <Button variant="default" className="w-full justify-start">
                                            <CheckCircle className="w-4 h-4 mr-2" />
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
