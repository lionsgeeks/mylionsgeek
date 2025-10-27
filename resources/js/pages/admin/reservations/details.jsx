import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, User, Mail, MapPin, Package, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export default function ReservationDetails({ reservation, equipments, teamMembers }) {
    const { post, processing } = useForm();
    const getInitials = useInitials();

    const handleApprove = () => {
        post(`/admin/reservations/${reservation.id}/approve`);
    };

    const handleCancel = () => {
        post(`/admin/reservations/${reservation.id}/cancel`);
    };

    const getStatusBadge = () => {
        if (reservation.canceled) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4 mr-1" />
                    Canceled
                </span>
            );
        }
        if (reservation.approved) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approved
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <AlertCircle className="w-4 h-4 mr-1" />
                Pending
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title={`Reservation #${reservation.id} Details`} />

            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href="/admin/reservations"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Reservations
                        </Link>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Reservation #{reservation.id}
                                </h1>
                                <p className="mt-2 text-lg text-gray-700">
                                    {reservation.title || `${reservation.type} Reservation`}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {getStatusBadge()}
                                {!reservation.canceled && !reservation.approved && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleApprove}
                                            disabled={processing}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={processing}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Reservation Details Card */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">Reservation Details</h2>
                            </div>

                            <div className="px-6 py-4 bg-blue-50 border-l-4 border-blue-400">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-semibold text-blue-900">Date:</span>
                                        <span className="ml-2 text-blue-800">{reservation.date || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-blue-900">Time:</span>
                                        <span className="ml-2 text-blue-800">{reservation.start || '—'} - {reservation.end || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-blue-900">User:</span>
                                        <span className="ml-2 text-blue-800">{reservation.user_name || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-blue-900">Email:</span>
                                        <span className="ml-2 text-blue-800">{reservation.user_email || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-blue-900">Type:</span>
                                        <span className="ml-2 text-blue-800 capitalize">{reservation.type?.replace('_', ' ') || '—'}</span>
                                    </div>
                                    {reservation.studio_name && (
                                        <div>
                                            <span className="font-semibold text-blue-900">Studio:</span>
                                            <span className="ml-2 text-blue-800">{reservation.studio_name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {reservation.description && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-900">Description</h2>
                                </div>
                                <div className="px-6 py-4">
                                    <p className="text-gray-800 whitespace-pre-wrap">{reservation.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Equipment & Team Members in Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Equipment */}
                            {equipments.length > 0 && (
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <Package className="w-5 h-5 mr-2 text-blue-600" />
                                            Equipment ({equipments.length})
                                        </h2>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="space-y-3">
                                            {equipments.map((equipment) => (
                                                <div key={equipment.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                                                    {/* Equipment Image */}
                                                    <div className="flex-shrink-0">
                                                        {equipment.image ? (
                                                            <img
                                                                src={equipment.image}
                                                                alt={equipment.reference}
                                                                className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                                <Package className="h-8 w-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Equipment Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900">{equipment.mark}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{equipment.reference}</p>
                                                        <p className="text-xs text-gray-500">{equipment.type_name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Team Members */}
                            {teamMembers.length > 0 && (
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                            <Users className="w-5 h-5 mr-2 text-green-600" />
                                            Team Members ({teamMembers.length})
                                        </h2>
                                    </div>
                                    <div className="px-6 py-4">
                                        <div className="space-y-3">
                                            {teamMembers.map((member) => (
                                                <div key={member.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                                                    {/* Member Avatar */}
                                                    <div className="flex-shrink-0">

                                                        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                                            <AvatarImage
                                                                 src={member.image}
                                                                alt={member.name}
                                                            />
                                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                                {getInitials(member.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    {/* Member Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900">{member.name}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{member.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status & Timestamps */}
                        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Status Information</h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Status:</span>
                                        <div>{getStatusBadge()}</div>
                                    </div>
                                    {reservation.approver_name && (
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-700">Approved by:</span>
                                            <span className="font-bold text-gray-900">{reservation.approver_name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Start Signed:</span>
                                        <span className={`font-bold ${reservation.start_signed ? 'text-green-600' : 'text-gray-700'}`}>
                                            {reservation.start_signed ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">End Signed:</span>
                                        <span className={`font-bold ${reservation.end_signed ? 'text-green-600' : 'text-gray-700'}`}>
                                            {reservation.end_signed ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-700">Passed:</span>
                                        <span className={`font-bold ${reservation.passed ? 'text-green-600' : 'text-gray-700'}`}>
                                            {reservation.passed ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Timestamps</h2>
                            </div>
                            <div className="px-6 py-4">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Created</p>
                                        <p className="font-bold text-gray-900">{new Date(reservation.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Last Updated</p>
                                        <p className="font-bold text-gray-900">{new Date(reservation.updated_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

