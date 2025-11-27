import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function VerifyEnd({ reservation, equipments, flash }) {
    const [equipmentStatus, setEquipmentStatus] = useState({});
    const [notes, setNotes] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        equipment_status: equipmentStatus,
        notes: notes,
    });

    // Update form data when state changes
    React.useEffect(() => {
        setData('equipment_status', equipmentStatus);
    }, [equipmentStatus, setData]);

    React.useEffect(() => {
        setData('notes', notes);
    }, [notes, setData]);

    const handleStatusChange = (equipmentId, statusType, checked) => {
        const updated = { ...equipmentStatus };
        if (!updated[equipmentId]) {
            updated[equipmentId] = {};
        }
        updated[equipmentId][statusType] = checked;
        setEquipmentStatus(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Build form data with proper structure for Laravel
        const formData = new FormData();
        
        // Add equipment_status as nested array structure
        Object.keys(equipmentStatus).forEach(equipmentId => {
            const status = equipmentStatus[equipmentId];
            Object.keys(status).forEach(statusType => {
                const value = status[statusType] ? '1' : '0';
                formData.append(`equipment_status[${equipmentId}][${statusType}]`, value);
            });
        });
        
        if (notes) {
            formData.append('notes', notes);
        }
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        fetch(`/reservations/${reservation.id}/verify-end`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
            body: formData
        })
        .then(response => {
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                // JSON response - get download URL and trigger download
                return response.json().then(data => {
                    if (data.downloadUrl) {
                        // Trigger PDF download by navigating to the URL
                        window.location.href = data.downloadUrl;
                    } else {
                        // Redirect to reservations page if no download URL
                        router.visit('/admin/reservations', {
                            preserveState: false,
                        });
                    }
                });
            } else if (contentType && contentType.includes('application/pdf')) {
                // PDF response - download directly
                return response.blob().then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Verification_Report_${reservation.id}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    // Redirect after download
                    setTimeout(() => {
                        router.visit('/admin/reservations', {
                            preserveState: false,
                        });
                    }, 500);
                });
            } else {
                // Redirect response
                router.visit('/admin/reservations', {
                    preserveState: false,
                });
            }
        })
        .catch(error => {
            console.error('Verification submission error:', error);
            alert('An error occurred while submitting the verification. Please try again.');
        });
    };


    const allEquipmentChecked = equipments.length > 0 && equipments.every(eq => {
        const status = equipmentStatus[eq.id] || {};
        return status.goodCondition !== undefined || status.badCondition !== undefined || status.notReturned !== undefined;
    });

    return (
        <AppLayout>
            <Head title="Material Verification" />
            <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">

            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg border border-gray-200 dark:border-neutral-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Material Condition Verification</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Please verify the condition of all materials used in this reservation.
                        </p>
                    </div>

                    <div className="px-6 py-4">
                        {/* Reservation Details */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">Reservation Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-blue-800 dark:text-blue-300">Title:</span>
                                    <span className="ml-2 text-blue-700 dark:text-blue-200">{reservation.title}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800 dark:text-blue-300">User:</span>
                                    <span className="ml-2 text-blue-700 dark:text-blue-200">{reservation.user_name}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800 dark:text-blue-300">Date:</span>
                                    <span className="ml-2 text-blue-700 dark:text-blue-200">{reservation.day}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800 dark:text-blue-300">Time:</span>
                                    <span className="ml-2 text-blue-700 dark:text-blue-200">{reservation.start} - {reservation.end}</span>
                                </div>
                            </div>
                            {reservation.description && (
                                <div className="mt-2">
                                    <span className="font-medium text-blue-800 dark:text-blue-300">Description:</span>
                                    <p className="mt-1 text-blue-700 dark:text-blue-200">{reservation.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Equipment List */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Equipment & Materials ({equipments.length} items)
                                </h2>

                                {equipments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No equipment found</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            This reservation doesn't have any equipment assigned.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {equipments.map((equipment) => (
                                            <div key={equipment.id} className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-800 hover:shadow-md dark:hover:shadow-lg transition-shadow">
                                                <div className="flex items-start space-x-3">
                                                    {/* Equipment Image */}
                                                    <div className="flex-shrink-0">
                                                        {equipment.image ? (
                                                            <img
                                                                src={equipment.image}
                                                                alt={equipment.reference}
                                                                className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-neutral-700"
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 bg-gray-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                                                                <span className="text-gray-400 dark:text-gray-500 text-xs">No Image</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Equipment Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="mb-2">
                                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                {equipment.reference}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {equipment.mark} • {equipment.type_name}
                                                            </p>
                                                        </div>

                                                        {/* Equipment Status Checkboxes */}
                                                        <div className="space-y-2">
                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={equipmentStatus[equipment.id]?.goodCondition || false}
                                                                    onChange={(e) => handleStatusChange(equipment.id, 'goodCondition', e.target.checked)}
                                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700"
                                                                />
                                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                <span className="text-sm text-green-700 dark:text-green-400 font-medium">Good Condition</span>
                                                            </label>

                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={equipmentStatus[equipment.id]?.badCondition || false}
                                                                    onChange={(e) => handleStatusChange(equipment.id, 'badCondition', e.target.checked)}
                                                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700"
                                                                />
                                                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                <span className="text-sm text-red-700 dark:text-red-400 font-medium">Bad Condition</span>
                                                            </label>

                                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={equipmentStatus[equipment.id]?.notReturned || false}
                                                                    onChange={(e) => handleStatusChange(equipment.id, 'notReturned', e.target.checked)}
                                                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700"
                                                                />
                                                                <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                                <span className="text-sm text-orange-700 dark:text-orange-400 font-medium">Not Returned</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notes Section */}
                            <div className="mb-6">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    rows={4}
                                    value={notes}
                                    onChange={(e) => {
                                        setNotes(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-neutral-700 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
                                    placeholder="Add any additional notes about equipment condition or issues..."
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-neutral-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !allEquipmentChecked}
                                    className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-neutral-800 ${
                                        processing || !allEquipmentChecked
                                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                    }`}
                                >
                                    {processing ? 'Submitting...' : 'Submit Verification'}
                                </button>
                            </div>

                            {!allEquipmentChecked && equipments.length > 0 && (
                                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                                    <div className="flex">
                                        <AlertTriangle className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                Please check at least one status option for all equipment before submitting.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
