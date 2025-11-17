import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import * as AvatarPrimitive from '@radix-ui/react-avatar';
// import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    Settings,
    Edit
} from 'lucide-react';
import Rolegard from '../../../components/rolegard';
import TeamMemberSelector from '../../admin/places/studios/components/TeamMemberSelector';
import EquipmentSelector from '../../admin/places/studios/components/EquipmentSelector';

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

    const { auth } = usePage().props;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [studios, setStudios] = useState([]);
    const [timeError, setTimeError] = useState('');

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

    // Check if user can edit: must be pending AND (user is owner OR admin)
    const userRoles = Array.isArray(auth?.user?.role) ? auth.user.role : [auth?.user?.role];
    const isAdmin = userRoles.includes('admin') || userRoles.includes('super_admin');
    const isOwner = reservation.user_id && auth?.user?.id && parseInt(reservation.user_id) === parseInt(auth.user.id);
    const canEdit = isPending && (isOwner || isAdmin);

    // Initialize form with reservation data
    const { data, setData, put, processing, errors, reset } = useForm({
        studio_id: reservation.studio_id || '',
        title: reservation.title || '',
        description: reservation.description || '',
        day: reservation.day || '',
        start: reservation.start || '',
        end: reservation.end || '',
        team_members: [],
        equipment: [],
    });

    // Load studios when modal opens
    useEffect(() => {
        if (isEditModalOpen && studios.length === 0) {
            fetch('/api/places', {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            })
                .then((r) => r.json())
                .then((data) => {
                    const studioList = Array.isArray(data?.studios) ? data.studios : [];
                    setStudios(studioList);
                })
                .catch(() => setStudios([]));
        }
    }, [isEditModalOpen]);

    // Initialize selected members and equipment from reservation
    useEffect(() => {
        if (isEditModalOpen && reservation.members && reservation.members.length > 0) {
            setSelectedMembers(reservation.members
                .filter(m => m.id || m.user_id)
                .map(m => ({
                    id: m.id || m.user_id,
                    name: m.name,
                    image: m.avatar
                })));
        }
        if (isEditModalOpen && reservation.equipments && reservation.equipments.length > 0) {
            setSelectedEquipment(reservation.equipments.map(e => ({
                id: e.id,
                reference: e.reference || '',
                mark: e.mark || '',
                type: e.type_name || ''
            })));
        }
    }, [isEditModalOpen]);

    useEffect(() => {
        setData('team_members', selectedMembers.map(m => m.id));
    }, [selectedMembers]);

    useEffect(() => {
        setData('equipment', selectedEquipment.map(e => e.id));
    }, [selectedEquipment]);

    const handleApprove = () => {
        router.post(`/admin/reservations/${reservation.id}/approve`);
    };

    const handleCancel = () => {
        router.post(`/admin/reservations/${reservation.id}/cancel`);
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditModalOpen(false);
        reset();
        setSelectedMembers([]);
        setSelectedEquipment([]);
        setTimeError('');
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        const startTime = data.start ? parseFloat(data.start.replace(':', '.')) : null;
        const endTime = data.end ? parseFloat(data.end.replace(':', '.')) : null;

        if (!startTime || !endTime) {
            setTimeError('Please select both start and end times.');
            return;
        }

        if (startTime < 8.0 || endTime > 18.0) {
            setTimeError('Reservation time must be between 08:00 and 18:00.');
            return;
        }

        if (endTime <= startTime) {
            setTimeError('End time must be later than start time.');
            return;
        }

        setTimeError('');

        const formData = {
            ...data,
            team_members: selectedMembers.map(m => m.id),
            equipment: selectedEquipment.map(e => e.id),
        };

        const route = isAdmin
            ? `/admin/reservations/${reservation.id}/update`
            : `/reservations/${reservation.id}/update`;

        put(route, {
            onSuccess: () => {
                handleCloseEdit();
                router.reload();
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Reservation Details - #${reservation.id}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href={isAdmin ? "/admin/reservations" : "/reservations"}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to reservations
                            </Button>
                        </Link>
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
                        {canEdit && (
                            <div className="ml-auto flex items-center gap-2">
                                <Button
                                    onClick={handleEdit}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit Reservation
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm bg-card/80 dark:bg-neutral-800/80 border border-sidebar-border/70">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 px-6 py-2">
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

                        <Card className="shadow-sm bg-card/80 dark:bg-neutral-800/80 border border-sidebar-border/70">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/10 px-6 py-2">
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

                        <Card className="shadow-sm bg-card/80 dark:bg-neutral-800/80 border border-sidebar-border/70">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/10 px-6 py-2">
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
                        <Card className="shadow-sm bg-card/80 dark:bg-neutral-800/80 border border-sidebar-border/70">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 px-6 py-2">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Reserved By
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    {/* <AvatarPrimitive.Root className="relative flex shrink-0 overflow-hidden rounded-full w-16 h-16 mx-auto mb-4">
                                        <AvatarImage src={normalizeImageUrl(reservation.user_avatar)} />
                                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-lg font-semibold flex size-full items-center justify-center rounded-full">
                                            {getInitials(reservation.user_name)}
                                        </AvatarFallback>
                                    </AvatarPrimitive.Root> */}
                                    <Avatar
                                        className="w-16 h-16"
                                        image={reservation?.user_avatar}
                                        name={reservation?.name}
                                        lastActivity={reservation?.online || null}
                                        onlineCircleClass="hidden"
                                        edit={false}
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
                            <Card className="shadow-sm bg-card/80 dark:bg-neutral-800/80 border border-sidebar-border/70">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/10 px-6 py-2">
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
                                                {/* <AvatarPrimitive.Root className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 mx-auto">
                                                    <AvatarImage src={normalizeImageUrl(member.avatar)} />
                                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-lg font-semibold flex size-full items-center justify-center rounded-full">
                                                        {getInitials(member.name)}
                                                    </AvatarFallback>
                                                </AvatarPrimitive.Root> */}
                                                <Avatar
                                                    className="w-10 h-10"
                                                    image={member?.image}
                                                    name={member?.name}
                                                    lastActivity={member?.last_online || null}
                                                    onlineCircleClass="hidden"
                                                    edit={false}
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
                            <Card className="shadow-sm bg-card/80 dark:bg-neutral-800/80 border border-sidebar-border/70">
                                <CardHeader className="px-6 py-4">
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

            {/* Edit Reservation Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={handleCloseEdit}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto max-md:w-[95vw] bg-light dark:bg-dark">
                    <DialogHeader>
                        <DialogTitle>Edit Reservation</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-title">Reservation Name</Label>
                                <Input
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px]"
                                    id="edit-title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter reservation name"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] bg-light dark:bg-dark"
                                    id="edit-description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter description (optional)"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-studio">Studio</Label>
                                <select
                                    id="edit-studio"
                                    className="mt-1 block w-full rounded-md border border-[#FFC801] bg-light dark:bg-dark px-3 py-2 focus:border-[#FFC801] focus:ring-[#FFC801] focus:ring-[1.5px]"
                                    value={data.studio_id}
                                    onChange={(e) => setData('studio_id', parseInt(e.target.value))}
                                    required
                                >
                                    <option value="">Select a studio</option>
                                    {studios.map((studio) => (
                                        <option key={studio.id} value={studio.id}>
                                            {studio.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.studio_id && (
                                    <p className="text-sm text-destructive mt-1">{errors.studio_id}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
                                <div>
                                    <Label htmlFor="edit-day">Date</Label>
                                    <Input
                                        className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                        id="edit-day"
                                        type="date"
                                        value={data.day}
                                        onChange={(e) => setData('day', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-start">Start Time</Label>
                                    <Input
                                        className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                        id="edit-start"
                                        type="time"
                                        value={data.start}
                                        onChange={(e) => setData('start', e.target.value)}
                                        required
                                        min="08:00"
                                        max="18:00"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-end">End Time</Label>
                                    <Input
                                        className="mt-1 block w-full border-[#FFC801] focus-visible:border-[#FFC801] focus-visible:ring-[#FFC801] focus-visible:ring-[1.5px] dark:[color-scheme:dark]"
                                        id="edit-end"
                                        type="time"
                                        value={data.end}
                                        onChange={(e) => setData('end', e.target.value)}
                                        required
                                        min="08:00"
                                        max="18:00"
                                    />
                                </div>
                            </div>

                            {timeError && (
                                <p className="text-sm text-red-500 font-medium">{timeError}</p>
                            )}

                            <div>
                                <Label>Team Members</Label>
                                <TeamMemberSelector
                                    selected={selectedMembers}
                                    onSelect={setSelectedMembers}
                                />
                            </div>

                            <div>
                                <Label>Equipment</Label>
                                <EquipmentSelector
                                    selected={selectedEquipment}
                                    onSelect={setSelectedEquipment}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseEdit}
                                    className="cursor-pointer dark:hover:bg-accent"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="cursor-pointer text-black hover:text-white dark:hover:text-black bg-[#FFC801] hover:bg-[#E5B700]"
                                >
                                    {processing ? 'Updating...' : 'Update Reservation'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}



