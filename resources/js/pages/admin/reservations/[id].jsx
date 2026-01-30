import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
// import * as AvatarPrimitive from '@radix-ui/react-avatar';
// import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Calendar,
    CalendarDays,
    CheckCircle,
    Clock,
    Edit,
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
import Rolegard from '../../../components/rolegard';
import EditReservationModal from './components/EditReservationModal';

export default function AdminReservationDetails({ reservation }) {
    const { auth, equipmentOptions = [], teamMemberOptions = [], studios: studioOptions = [] } = usePage().props;
    const userRoles = Array.isArray(auth?.user?.role) ? auth.user.role : [auth?.user?.role];
    const isAdmin =
        userRoles.includes('admin') ||
        userRoles.includes('moderateur') ||
        userRoles.includes('super_admin') ||
        userRoles.includes('studio_responsable');
    const handleBackNavigation = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
            return;
        }
        router.visit(isAdmin ? '/admin/reservations' : '/students/reservations');
    };

    if (!reservation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background">
                <Card className="shadow-sm">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-medium text-foreground">Reservation not found</h3>
                        <p className="mb-4 text-muted-foreground">The requested reservation could not be found.</p>
                        <Button variant="outline" onClick={handleBackNavigation}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to reservations
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [studios, setStudios] = useState(studioOptions);
    const [timeError, setTimeError] = useState('');

    const getStatusBadge = () => {
        if (reservation.canceled) {
            return (
                <span
                    className={`inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/15 px-3 py-1.5 text-sm font-medium text-red-800 dark:text-red-300`}
                >
                    <XCircle className="h-4 w-4" />
                    Canceled
                </span>
            );
        }
        if (reservation.approved) {
            return (
                <span
                    className={`inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/15 px-3 py-1.5 text-sm font-medium text-green-800 dark:text-green-300`}
                >
                    <CheckCircle className="h-4 w-4" />
                    Approved
                </span>
            );
        }
        if (reservation.type === 'exterior' && reservation.studio_responsable_approved) {
            return (
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/20`}>
                    <AlertCircle className="w-4 h-4" />
                    Pending (Studio Approved)
                </span>
            );
        }
        return (
            <span
                className={`inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/15 px-3 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-300`}
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

    // Check if user can edit: must be pending AND (user is owner OR admin)
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

    useEffect(() => {
        setStudios(studioOptions);
    }, [studioOptions]);

    // Initialize selected members and equipment from reservation
    useEffect(() => {
        if (isEditModalOpen && reservation.members && reservation.members.length > 0) {
            setSelectedMembers(
                reservation.members
                    .filter((m) => m.id || m.user_id)
                    .map((m) => ({
                        id: m.id || m.user_id,
                        name: m.name,
                        image: m.avatar,
                    })),
            );
        }
        if (isEditModalOpen && reservation.equipments && reservation.equipments.length > 0) {
            setSelectedEquipment(
                reservation.equipments.map((e) => ({
                    id: e.id,
                    reference: e.reference || '',
                    mark: e.mark || '',
                    type: e.type_name || '',
                })),
            );
        }
    }, [isEditModalOpen]);

    useEffect(() => {
        setData(
            'team_members',
            selectedMembers.map((m) => m.id),
        );
    }, [selectedMembers]);

    useEffect(() => {
        setData(
            'equipment',
            selectedEquipment.map((e) => e.id),
        );
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
            team_members: selectedMembers.map((m) => m.id),
            equipment: selectedEquipment.map((e) => e.id),
        };

        const route = isAdmin ? `/admin/reservations/${reservation.id}/update` : `/reservations/${reservation.id}/update`;

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

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleBackNavigation}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Reservation Details</h1>
                            <Rolegard authorized={['admin', 'super_admin', 'studio_responsable']}>
                                <p className="text-muted-foreground">Reservation #{reservation.id}</p>
                            </Rolegard>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {getStatusBadge()}
                        <span className="text-sm text-muted-foreground">Created {new Date(reservation.created_at).toLocaleDateString()}</span>

                        {canEdit && (
                            <div className="ml-auto flex items-center gap-2">
                                <Button onClick={handleEdit} variant="outline" size="sm">
                                    <Edit className="mr-1 h-4 w-4" />
                                    Edit Reservation
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="border border-sidebar-border/70 bg-card/80 shadow-sm dark:bg-neutral-800/80">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-2 dark:from-purple-900/20 dark:to-pink-900/10">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Reservation Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-2 text-xl font-semibold text-foreground">{reservation.title || 'Untitled Reservation'}</h3>
                                        <p className="mb-4 text-muted-foreground">{reservation.description || 'No description available.'}</p>
                                        <div className="mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="border-accent/50 bg-accent/30 text-xs text-foreground capitalize">
                                                {reservation.type || 'No type'}
                                            </Badge>
                                            {reservation.approved && (
                                                <Badge
                                                    variant="default"
                                                    className="border border-green-500/20 bg-green-500/15 text-xs text-green-800 dark:text-green-300"
                                                >
                                                    Approved
                                                </Badge>
                                            )}
                                            {reservation.type === 'exterior' && reservation.studio_responsable_approved && !reservation.approved && (
                                                <Badge variant="default" className="text-xs bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/20">
                                                    Studio Approved
                                                </Badge>
                                            )}
                                            {reservation.canceled && (
                                                <Badge
                                                    variant="destructive"
                                                    className="border border-red-500/20 bg-red-500/15 text-xs text-red-700 dark:text-red-300"
                                                >
                                                    Canceled
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">ID: #{reservation.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                Created: {reservation.created_at ? new Date(reservation.created_at).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        {reservation.approver_name && (
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-4 w-4 text-green-600 dark:text-green-300" />
                                                <span className="text-sm text-green-600 dark:text-green-300">
                                                    Approved by: {reservation.approver_name}
                                                </span>
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

                        <Card className="border border-sidebar-border/70 bg-card/80 shadow-sm dark:bg-neutral-800/80">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-2 dark:from-blue-900/20 dark:to-purple-900/10">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Equipment Information ({reservation.equipments?.length || 0} items)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {reservation.equipments && reservation.equipments.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {reservation.equipments.map((equipment, index) => (
                                            <div
                                                key={equipment.id || index}
                                                className="rounded-lg border border-sidebar-border/70 p-4 transition-shadow hover:shadow-md"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {equipment.image ? (
                                                            <img
                                                                src={normalizeImageUrl(equipment.image)}
                                                                alt={equipment.name}
                                                                className="h-16 w-16 rounded-lg border border-sidebar-border/70 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted">
                                                                <Package className="h-6 w-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate text-sm font-semibold text-foreground">{equipment.name}</h4>
                                                        {equipment.type_name && (
                                                            <div className="mt-2 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">{equipment.type_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Package className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                                        <p className="text-muted-foreground">No equipment assigned to this reservation</p>
                                    </div>
                                )}

                                {reservation.studio_name && (
                                    <div className="mt-4 border-t border-sidebar-border/70 pt-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Building2 className="h-4 w-4" />
                                            <span>Studio: {reservation.studio_name}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-sidebar-border/70 bg-card/80 shadow-sm dark:bg-neutral-800/80">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-2 dark:from-green-900/20 dark:to-blue-900/10">
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
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Start Time</span>
                                            </div>
                                            <p className="font-medium text-foreground">{formatTime(reservation.start_time)}</p>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">End Time</span>
                                            </div>
                                            <p className="font-medium text-foreground">{formatTime(reservation.end_time)}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Duration</span>
                                            </div>
                                            <p className="font-medium text-foreground">
                                                {calculateDuration(reservation.start_time, reservation.end_time)}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Reservation Date</span>
                                            </div>
                                            <p className="font-medium text-foreground">
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
                                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Status</span>
                                            </div>
                                            {getStatusBadge()}
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center gap-2">
                                                <Hash className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Reservation ID</span>
                                            </div>
                                            <p className="font-mono font-medium text-foreground">#{reservation.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border border-sidebar-border/70 bg-card/80 shadow-sm dark:bg-neutral-800/80">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-2 dark:from-purple-900/20 dark:to-pink-900/10">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Reserved By
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    {/* <AvatarPrimitive.Root className="relative flex shrink-0 overflow-hidden rounded-full w-16 h-16 mx-auto mb-4">
                                        <AvatarImage src={normalizeImageUrl(reservation.user_avatar)} />
                                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-lg font-semibold flex size-full items-center justify-center rounded-full">
                                            {getInitials(reservation.user_name)}
                                        </AvatarFallback>
                                    </AvatarPrimitive.Root> */}
                                    <Avatar
                                        className="h-16 w-16"
                                        image={reservation?.user_avatar?.split('/').pop()}
                                        name={reservation?.name}
                                        lastActivity={reservation?.online || null}
                                        onlineCircleClass="hidden"
                                        edit={false}
                                    />
                                    <h3 className="mb-2 text-lg font-semibold text-foreground">{reservation.user_name || 'Unknown User'}</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
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
                            <Card className="border border-sidebar-border/70 bg-card/80 shadow-sm dark:bg-neutral-800/80">
                                <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 px-6 py-2 dark:from-indigo-900/20 dark:to-cyan-900/10">
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Team Members
                                        <span className="rounded-full bg-muted px-2 py-1 text-xs text-foreground">{reservation.members.length}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {reservation.members.map((member, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                                            >
                                                {/* <AvatarPrimitive.Root className="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 mx-auto">
                                                    <AvatarImage src={normalizeImageUrl(member.avatar)} />
                                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-lg font-semibold flex size-full items-center justify-center rounded-full">
                                                        {getInitials(member.name)}
                                                    </AvatarFallback>
                                                </AvatarPrimitive.Root> */}
                                                <Avatar
                                                    className="h-10 w-10"
                                                    image={member?.avatar?.split('/').pop()}
                                                    name={member?.name}
                                                    lastActivity={member?.last_online || null}
                                                    onlineCircleClass="hidden"
                                                    edit={false}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                                                        {member.role && (
                                                            <Badge variant="secondary" className="bg-accent/30 text-xs text-foreground">
                                                                {member.role}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <UserCheck className="h-4 w-4 text-green-600 dark:text-green-300" />
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

            <EditReservationModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEdit}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                timeError={timeError}
                studios={studios}
                selectedMembers={selectedMembers}
                setSelectedMembers={setSelectedMembers}
                selectedEquipment={selectedEquipment}
                setSelectedEquipment={setSelectedEquipment}
                equipmentOptions={equipmentOptions}
                teamMemberOptions={teamMemberOptions}
                onSubmit={handleUpdate}
            />
        </AppLayout>
    );
}
