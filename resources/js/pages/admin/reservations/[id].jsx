import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, } from '@/components/ui/avatar';
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
import Rolegard from '../../../components/rolegard';

export default function AdminReservationDetails({ reservation }) {
    if (!reservation) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
                <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Reservation not found</h3>
                        <p className="text-muted-foreground mb-4">The requested reservation could not be found.</p>
                        <Link href="/admin/reservations">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
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
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/20`}>
                    <XCircle className="w-4 h-4" />
                    Canceled
                </span>
            );
        }
        if (reservation.approved) {
            return (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-green-500/15 text-green-800 dark:text-green-300 border-green-500/20`}>
                    <CheckCircle className="w-4 h-4" />
                    Approved
                </span>
            );
        }
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/20`}>
                <AlertCircle className="w-4 h-4" />
                Pending
            </span>
        );
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">

                        <Rolegard authorized={["admin", "super_admin"]}>
                            <Link href="/admin/reservations">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to reservations
                                </Button>
                            </Link>
                        </Rolegard>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Reservation Details</h1>
                            <Rolegard authorized={["admin", "super_admin"]}>

                                <p className="text-muted-foreground">Reservation #{reservation.id}</p>
                            </Rolegard>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {getStatusBadge()}
                        <span className="text-sm text-muted-foreground">
                            Created {new Date(reservation.created_at).toLocaleDateString()}
                        </span>
                        <Rolegard authorized={["admin", "super_admin"]}>
                            {isPending && (
                                <div className="ml-auto flex items-center gap-2">
                                    <Button
                                        onClick={handleApprove}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                        size="sm"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={handleCancel}
                                        variant="destructive"
                                        size="sm"
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </Rolegard>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm bg-card border border-sidebar-border/70">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Reservation Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            {reservation.title || 'Untitled Reservation'}
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            {reservation.description || 'No description available.'}
                                        </p>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs bg-accent/30 border-accent/50 text-foreground capitalize">
                                                {reservation.type || 'No type'}
                                            </Badge>
                                            {reservation.approved && (
                                                <Badge variant="default" className="text-xs bg-green-500/15 text-green-800 dark:text-green-300 border border-green-500/20">
                                                    Approved
                                                </Badge>
                                            )}
                                            {reservation.canceled && (
                                                <Badge variant="destructive" className="text-xs bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20">
                                                    Canceled
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">ID: #{reservation.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Created: {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        {reservation.approver_name && (
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="w-4 h-4 text-green-600 dark:text-green-300" />
                                                <span className="text-sm text-green-600 dark:text-green-300">Approved by: {reservation.approver_name}</span>
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

                        <Card className="shadow-sm bg-card border border-sidebar-border/70">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/10">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Equipment Information ({reservation.equipments?.length || 0} items)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {reservation.equipments && reservation.equipments.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {reservation.equipments.map((equipment, index) => (
                                            <div key={equipment.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-sidebar-border/70">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {equipment.image ? (
                                                            <img
                                                                src={normalizeImageUrl(equipment.image)}
                                                                alt={equipment.name}
                                                                className="w-16 h-16 object-cover rounded-lg border border-sidebar-border/70"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-muted rounded-lg border flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-foreground truncate">
                                                            {equipment.name}
                                                        </h4>
                                                        {equipment.type_name && (
                                                            <div className="flex items-center gap-1 mt-2">
                                                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">{equipment.type_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-muted-foreground">No equipment assigned to this reservation</p>
                                    </div>
                                )}

                                {reservation.studio_name && (
                                    <div className="mt-4 pt-4 border-t border-sidebar-border/70">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Building2 className="w-4 h-4" />
                                            <span>Studio: {reservation.studio_name}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm bg-card border border-sidebar-border/70">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/10">
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
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Start Time</span>
                                            </div>
                                            <p className="text-foreground font-medium">
                                                {formatTime(reservation.start_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">End Time</span>
                                            </div>
                                            <p className="text-foreground font-medium">
                                                {formatTime(reservation.end_time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Timer className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Duration</span>
                                            </div>
                                            <p className="text-foreground font-medium">
                                                {calculateDuration(reservation.start_time, reservation.end_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Reservation Date</span>
                                            </div>
                                            <p className="text-foreground font-medium">
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
                                                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Status</span>
                                            </div>
                                            {getStatusBadge()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Hash className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Reservation ID</span>
                                            </div>
                                            <p className="text-foreground font-medium font-mono">
                                                #{reservation.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* {reservation.notes && (
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
                        )} */}
                    </div>

                    <div className="space-y-6">
                        <Card className="shadow-sm bg-card border border-sidebar-border/70">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Reserved By
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    {/* <Avatar className="w-16 h-16 mx-auto mb-4">
                                        <AvatarImage src={normalizeImageUrl(reservation.user_avatar)} />
                                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-lg font-semibold">
                                            {getInitials(reservation.user_name)}
                                        </AvatarFallback>
                                    </Avatar> */}
                                    <Avatar
                                        className="w-16 h-16 mx-auto mb-4"
                                        image={normalizeImageUrl(reservation.user_avatar)}
                                        name={reservation.user_name}
                                        onlineCircleClass="hidden"
                                    />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {reservation.user_name || 'Unknown User'}
                                    </h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
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

                        {reservation.members && reservation.members.length > 0 && (
                            <Card className="shadow-sm bg-card border border-sidebar-border/70">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/10">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Team Members
                                        <span className="bg-muted text-foreground text-xs px-2 py-1 rounded-full">
                                            {reservation.members.length}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {reservation.members.map((member, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                                {/* <Avatar className="w-12 h-12">
                                                    <AvatarImage src={normalizeImageUrl(member.avatar)} />
                                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold">
                                                        {getInitials(member.name)}
                                                    </AvatarFallback>
                                                </Avatar> */}
                                                <Avatar
                                                    className="w-12 h-12"
                                                    image={normalizeImageUrl(member.avatar)}
                                                    name={member.name}
                                                    onlineCircleClass="hidden"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {member.name}
                                                        </p>
                                                        {member.role && (
                                                            <Badge variant="secondary" className="text-xs bg-accent/30 text-foreground">
                                                                {member.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {member.email}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <UserCheck className="w-4 h-4 text-green-600 dark:text-green-300" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <Rolegard authorized={["admin", "super_admin"]}>
                            <Card className="shadow-sm bg-card border border-sidebar-border/70">
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
                        </Rolegard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}



