import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, Calendar, Users, Package, Building2, Clock, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ITEMS_PER_PAGE = 5;

export default function Analytics({
    totalStats = {},
    studioReservations = [],
    timeSlotStats = {},
    topUsers = [],
    topEquipment = [],
    damagedEquipment = [],
    activeEquipment = [],
    monthlyTrend = []
}) {
    const [userPage, setUserPage] = useState(1);
    const [equipmentPage, setEquipmentPage] = useState(1);
    const [damagedPage, setDamagedPage] = useState(1);
    const [activePage, setActivePage] = useState(1);

    const paginate = (items, page) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const totalUserPages = Math.ceil((topUsers?.length || 0) / ITEMS_PER_PAGE);
    const totalEquipmentPages = Math.ceil((topEquipment?.length || 0) / ITEMS_PER_PAGE);
    const totalDamagedPages = Math.ceil((damagedEquipment?.length || 0) / ITEMS_PER_PAGE);
    const totalActivePages = Math.ceil((activeEquipment?.length || 0) / ITEMS_PER_PAGE);

    return (
        <AppLayout>
            <Head title="Reservation Analytics" />

            <div className="px-4 py-6 sm:p-8 lg:p-10">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin/reservations"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Reservations
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservation Analytics & Reporting</h1>
                    <p className="text-gray-600">Comprehensive statistics and insights about reservations, studios, equipment, and users</p>
                </div>

                {/* Total Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStats.total_reservations || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cowork Reservations</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStats.total_cowork_reservations || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStats.total_equipment || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStats.total_users || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Studios</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStats.total_studios || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Studio Reservations Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                                Studio Reservations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={studioReservations}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Monthly Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                Monthly Reservation Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2 text-purple-600" />
                                Most Reserved Equipment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {topEquipment.length > 0 ? (
                                    <>
                                        {paginate(topEquipment, equipmentPage).map((eq, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-shadow">
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 object-cover rounded-lg border-2 border-purple-200"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Package className="h-8 w-8 text-purple-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900">{eq.mark}</p>
                                                    <p className="text-sm text-gray-600">{eq.reference}</p>
                                                    <p className="text-xs text-gray-500">{eq.type_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-purple-600">{eq.count}</div>
                                                    <p className="text-xs text-gray-500">reservations</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalEquipmentPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-3 border-t">
                                                <button
                                                    onClick={() => setEquipmentPage(p => Math.max(1, p - 1))}
                                                    disabled={equipmentPage === 1}
                                                    className="p-2 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {equipmentPage} of {totalEquipmentPages}
                                                </span>
                                                <button
                                                    onClick={() => setEquipmentPage(p => Math.min(totalEquipmentPages, p + 1))}
                                                    disabled={equipmentPage === totalEquipmentPages}
                                                    className="p-2 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No equipment data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Damaged Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2 text-red-600" />
                                Damaged Equipment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(damagedEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(damagedEquipment, damagedPage).map((eq, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg hover:shadow-md transition-shadow">
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 object-cover rounded-lg border-2 border-red-200 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Package className="h-8 w-8 text-red-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900">{eq.mark}</p>
                                                    <p className="text-sm text-gray-600">{eq.reference}</p>
                                                    <p className="text-xs text-gray-500">{eq.type_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalDamagedPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-3 border-t">
                                                <button
                                                    onClick={() => setDamagedPage(p => Math.max(1, p - 1))}
                                                    disabled={damagedPage === 1}
                                                    className="p-2 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {damagedPage} of {totalDamagedPages}
                                                </span>
                                                <button
                                                    onClick={() => setDamagedPage(p => Math.min(totalDamagedPages, p + 1))}
                                                    disabled={damagedPage === totalDamagedPages}
                                                    className="p-2 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No damaged equipment</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Active Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2 text-blue-600" />
                                    Active Equipment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(activeEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(activeEquipment, activePage).map((eq, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow">
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 object-cover rounded-lg border-2 border-blue-200 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Package className="h-8 w-8 text-blue-600" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900">{eq.mark}</p>
                                                    <p className="text-sm text-gray-600">{eq.reference}</p>
                                                    <p className="text-xs text-gray-500">{eq.type_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalActivePages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-3 border-t">
                                                <button
                                                    onClick={() => setActivePage(p => Math.max(1, p - 1))}
                                                    disabled={activePage === 1}
                                                    className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {activePage} of {totalActivePages}
                                                </span>
                                                <button
                                                    onClick={() => setActivePage(p => Math.min(totalActivePages, p + 1))}
                                                    disabled={activePage === totalActivePages}
                                                    className="p-2 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No active equipment right now</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Equipment by Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                                Active Equipment by Type
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const counts = (activeEquipment || []).reduce((acc, item) => {
                                    const key = item?.type_name || 'Unknown';
                                    acc[key] = (acc[key] || 0) + 1;
                                    return acc;
                                }, {});
                                const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
                                if (data.length === 0) {
                                    return <p className="text-gray-500 text-center py-8">No active equipment data</p>;
                                }
                                return (
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                    {data.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="w-5 h-5 mr-2 text-green-600" />
                                Most Active Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(topUsers?.length || 0) > 0 ? (
                                    <>
                                        {paginate(topUsers, userPage).map((user, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        className="h-16 w-16 object-cover rounded-full border-2 border-green-200 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-bold text-lg">
                                                            {user.name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-2xl font-bold text-green-600">{user.count}</div>
                                                    <p className="text-xs text-gray-500">reservations</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalUserPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-3 border-t">
                                                <button
                                                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                                    disabled={userPage === 1}
                                                    className="p-2 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {userPage} of {totalUserPages}
                                                </span>
                                                <button
                                                    onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                                                    disabled={userPage === totalUserPages}
                                                    className="p-2 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No user data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Slot Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                Time Slot Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {timeSlotStats.most_reserved && (
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-green-900">Most Reserved Time:</span>
                                            <span className="text-2xl font-bold text-green-700">{timeSlotStats.most_reserved.time}</span>
                                        </div>
                                        <p className="text-sm text-green-700">{timeSlotStats.most_reserved.count} reservations</p>
                                    </div>
                                )}

                                {timeSlotStats.least_reserved && (
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-orange-900">Least Reserved Time:</span>
                                            <span className="text-2xl font-bold text-orange-700">{timeSlotStats.least_reserved.time}</span>
                                        </div>
                                        <p className="text-sm text-orange-700">{timeSlotStats.least_reserved.count} reservations</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

