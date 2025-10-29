import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Building2, Calendar, ChevronLeft, ChevronRight, Clock, Package, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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
    monthlyTrend = [],
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

    // Aggregates for small badges
    const studioTotal = (studioReservations || []).reduce((sum, s) => sum + (s.count || 0), 0);
    const topEquipmentTotal = topEquipment?.length || 0;
    const damagedTotal = damagedEquipment?.length || 0;
    const activeTotal = activeEquipment?.length || 0;
    const usersTotal = topUsers?.length || 0;

    return (
        <AppLayout>
            <Head title="Reservation Analytics" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:p-8 lg:p-10">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/admin/reservations" className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Reservations
                    </Link>

                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Reservation Analytics & Reporting</h1>
                    <p className="text-gray-600">Comprehensive statistics and insights about reservations, studios, equipment, and users</p>
                </div>

                {/* Total Statistics Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
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

                <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Studio Reservations Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                                Studio Reservations
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{studioTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={studioReservations}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
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
                                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                                Monthly Reservation Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
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

                <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Top Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5 text-purple-600" />
                                Most Reserved Equipment
                                <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{topEquipmentTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(topEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(topEquipment, equipmentPage).map((eq, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 p-4 transition-shadow hover:shadow-md"
                                            >
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 rounded-lg border-2 border-purple-200 object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-purple-200 shadow-sm">
                                                        <Package className="h-8 w-8 text-purple-600" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
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
                                            <div className="flex items-center justify-center gap-2 border-t pt-3">
                                                <button
                                                    onClick={() => setEquipmentPage((p) => Math.max(1, p - 1))}
                                                    disabled={equipmentPage === 1}
                                                    className="rounded-lg p-2 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {equipmentPage} of {totalEquipmentPages}
                                                </span>
                                                <button
                                                    onClick={() => setEquipmentPage((p) => Math.min(totalEquipmentPages, p + 1))}
                                                    disabled={equipmentPage === totalEquipmentPages}
                                                    className="rounded-lg p-2 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-gray-500">No equipment data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Damaged Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5 text-red-600" />
                                Damaged Equipment
                                <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{damagedTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(damagedEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(damagedEquipment, damagedPage).map((eq, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 p-4 transition-shadow hover:shadow-md"
                                            >
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 flex-shrink-0 rounded-lg border-2 border-red-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-red-200 shadow-sm">
                                                        <Package className="h-8 w-8 text-red-600" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-gray-900">{eq.mark}</p>
                                                    <p className="text-sm text-gray-600">{eq.reference}</p>
                                                    <p className="text-xs text-gray-500">{eq.type_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalDamagedPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 border-t pt-3">
                                                <button
                                                    onClick={() => setDamagedPage((p) => Math.max(1, p - 1))}
                                                    disabled={damagedPage === 1}
                                                    className="rounded-lg p-2 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {damagedPage} of {totalDamagedPages}
                                                </span>
                                                <button
                                                    onClick={() => setDamagedPage((p) => Math.min(totalDamagedPages, p + 1))}
                                                    disabled={damagedPage === totalDamagedPages}
                                                    className="rounded-lg p-2 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-gray-500">No damaged equipment</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Active Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5 text-blue-600" />
                                Active Equipment
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{activeTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(activeEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(activeEquipment, activePage).map((eq, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-4 transition-shadow hover:shadow-md"
                                            >
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 flex-shrink-0 rounded-lg border-2 border-blue-200 object-cover shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-blue-200 shadow-sm">
                                                        <Package className="h-8 w-8 text-blue-600" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-gray-900">{eq.mark}</p>
                                                    <p className="text-sm text-gray-600">{eq.reference}</p>
                                                    <p className="text-xs text-gray-500">{eq.type_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalActivePages > 1 && (
                                            <div className="flex items-center justify-center gap-2 border-t pt-3">
                                                <button
                                                    onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                                                    disabled={activePage === 1}
                                                    className="rounded-lg p-2 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {activePage} of {totalActivePages}
                                                </span>
                                                <button
                                                    onClick={() => setActivePage((p) => Math.min(totalActivePages, p + 1))}
                                                    disabled={activePage === totalActivePages}
                                                    className="rounded-lg p-2 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-gray-500">No active equipment right now</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Equipment by Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
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
                                    return <p className="py-8 text-center text-gray-500">No active equipment data</p>;
                                }
                                return (
                                    <div className="h-72">
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

                <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Top Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5 text-green-600" />
                                Most Active Users
                                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">{usersTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(topUsers?.length || 0) > 0 ? (
                                    <>
                                        {paginate(topUsers, userPage).map((user, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 p-4 transition-shadow hover:shadow-md"
                                            >
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-green-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
                                                        <span className="text-lg font-bold text-white">
                                                            {user.name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-gray-900">
                                                        # {(userPage - 1) * ITEMS_PER_PAGE + index + 1} {user.name}
                                                    </p>
                                                    <p className="truncate text-sm text-gray-600">{user.email}</p>
                                                </div>
                                                <div className="flex-shrink-0 text-right">
                                                    <div className="text-2xl font-bold text-green-600">{user.count}</div>
                                                    <p className="text-xs text-gray-500">reservations</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalUserPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 border-t pt-3">
                                                <button
                                                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                                                    disabled={userPage === 1}
                                                    className="rounded-lg p-2 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    Page {userPage} of {totalUserPages}
                                                </span>
                                                <button
                                                    onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                                                    disabled={userPage === totalUserPages}
                                                    className="rounded-lg p-2 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-gray-500">No user data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Slot Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                                Time Slot Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {timeSlotStats.most_reserved && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-semibold text-green-900">Most Reserved Time:</span>
                                            <span className="text-2xl font-bold text-green-700">{timeSlotStats.most_reserved.time}</span>
                                        </div>
                                        <p className="text-sm text-green-700">{timeSlotStats.most_reserved.count} reservations</p>
                                    </div>
                                )}

                                {timeSlotStats.least_reserved && (
                                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                        <div className="mb-2 flex items-center justify-between">
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
