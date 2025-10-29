import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import React, { useState } from 'react';

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

        // Create a form and submit it directly to bypass Inertia.js
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/reservations/${reservation.id}/verify-end`;
        form.target = '_blank'; // Open in new tab

        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Add equipment status data
        Object.keys(equipmentStatus).forEach((equipmentId) => {
            const status = equipmentStatus[equipmentId];
            Object.keys(status).forEach((statusType) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = `equipment_status[${equipmentId}][${statusType}]`;
                input.value = status[statusType] ? '1' : '0';
                form.appendChild(input);
            });
        });

        // Add notes
        if (notes) {
            const notesInput = document.createElement('input');
            notesInput.type = 'hidden';
            notesInput.name = 'notes';
            notesInput.value = notes;
            form.appendChild(notesInput);
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Redirect to dashboard after a delay
        setTimeout(() => {
            router.visit('/admin/dashboard');
        }, 2000);
    };

    const allEquipmentChecked =
        equipments.length > 0 &&
        equipments.every((eq) => {
            const status = equipmentStatus[eq.id] || {};
            return status.goodCondition !== undefined || status.badCondition !== undefined || status.notReturned !== undefined;
        });

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Head title="Material Verification" />

            <div className="mx-auto max-w-4xl">
                <div className="rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h1 className="text-2xl font-bold text-gray-900">Material Condition Verification</h1>
                        <p className="mt-2 text-gray-600">Please verify the condition of all materials used in this reservation.</p>
                    </div>

                    <div className="px-6 py-4">
                        {/* Reservation Details */}
                        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <h2 className="mb-2 text-lg font-semibold text-blue-900">Reservation Details</h2>
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                <div>
                                    <span className="font-medium text-blue-800">Title:</span>
                                    <span className="ml-2 text-blue-700">{reservation.title}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">User:</span>
                                    <span className="ml-2 text-blue-700">{reservation.user_name}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Date:</span>
                                    <span className="ml-2 text-blue-700">{reservation.day}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-blue-800">Time:</span>
                                    <span className="ml-2 text-blue-700">
                                        {reservation.start} - {reservation.end}
                                    </span>
                                </div>
                            </div>
                            {reservation.description && (
                                <div className="mt-2">
                                    <span className="font-medium text-blue-800">Description:</span>
                                    <p className="mt-1 text-blue-700">{reservation.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Equipment List */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <h2 className="mb-4 text-lg font-semibold text-gray-900">Equipment & Materials ({equipments.length} items)</h2>

                                {equipments.length === 0 ? (
                                    <div className="py-8 text-center text-gray-500">
                                        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
                                        <p className="mt-1 text-sm text-gray-500">This reservation doesn't have any equipment assigned.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {equipments.map((equipment) => (
                                            <div
                                                key={equipment.id}
                                                className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    {/* Equipment Image */}
                                                    <div className="flex-shrink-0">
                                                        {equipment.image ? (
                                                            <img
                                                                src={equipment.image}
                                                                alt={equipment.reference}
                                                                className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                                                                <span className="text-xs text-gray-400">No Image</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Equipment Details */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-2">
                                                            <h3 className="truncate text-sm font-medium text-gray-900">{equipment.reference}</h3>
                                                            <p className="text-xs text-gray-500">
                                                                {equipment.mark} • {equipment.type_name}
                                                            </p>
                                                        </div>

                                                        {/* Equipment Status Checkboxes */}
                                                        <div className="space-y-2">
                                                            <label className="flex cursor-pointer items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={equipmentStatus[equipment.id]?.goodCondition || false}
                                                                    onChange={(e) =>
                                                                        handleStatusChange(equipment.id, 'goodCondition', e.target.checked)
                                                                    }
                                                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                                />
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                                <span className="text-sm font-medium text-green-700">Good Condition</span>
                                                            </label>

                                                            <label className="flex cursor-pointer items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={equipmentStatus[equipment.id]?.badCondition || false}
                                                                    onChange={(e) =>
                                                                        handleStatusChange(equipment.id, 'badCondition', e.target.checked)
                                                                    }
                                                                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                                />
                                                                <XCircle className="h-4 w-4 text-red-600" />
                                                                <span className="text-sm font-medium text-red-700">Bad Condition</span>
                                                            </label>

                                                            <label className="flex cursor-pointer items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={equipmentStatus[equipment.id]?.notReturned || false}
                                                                    onChange={(e) =>
                                                                        handleStatusChange(equipment.id, 'notReturned', e.target.checked)
                                                                    }
                                                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                                />
                                                                <XCircle className="h-4 w-4 text-orange-600" />
                                                                <span className="text-sm font-medium text-orange-700">Not Returned</span>
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
                                <label htmlFor="notes" className="mb-2 block text-sm font-medium text-gray-700">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    rows={4}
                                    value={notes}
                                    onChange={(e) => {
                                        setNotes(e.target.value);
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Add any additional notes about equipment condition or issues..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !allEquipmentChecked}
                                    className={`rounded-md border border-transparent px-6 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
                                        processing || !allEquipmentChecked ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {processing ? 'Submitting...' : 'Submit Verification'}
                                </button>
                            </div>

                            {!allEquipmentChecked && equipments.length > 0 && (
                                <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
                                    <div className="flex">
                                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-800">
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
    );
}
