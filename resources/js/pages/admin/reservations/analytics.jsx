import StatCard from '@/components/StatCard';
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

    const overviewStats = [
        {
            title: 'Total Reservations',
            value: totalStats.total_reservations || 0,
            icon: Calendar,
        },
        {
            title: 'Cowork Reservations',
            value: totalStats.total_cowork_reservations || 0,
            icon: Building2,
        },
        {
            title: 'Total Equipment',
            value: totalStats.total_equipment || 0,
            icon: Package,
        },
    ];

    return (
        <AppLayout>
            <Head title="Reservation Analytics" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:p-8 lg:p-10">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/admin/reservations" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Reservations
                    </Link>

                    <h1 className="mb-2 text-3xl font-bold text-foreground">Reservation Analytics & Reporting</h1>
                    <p className="text-muted-foreground">Comprehensive statistics and insights about reservations, studios, equipment, and users</p>
                </div>

                <StatCard statsData={overviewStats} />

                <div className="my-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Studio Reservations Chart */}
                    <Card className="bg-light dark:bg-dark">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building2 className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Studio Reservations
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                    {studioTotal}
                                </span>
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
                    <Card className="bg-light dark:bg-dark">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
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
                    <Card className="bg-light dark:bg-dark">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                                Most Reserved Equipment
                                <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                                    {topEquipmentTotal}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(topEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(topEquipment, equipmentPage).map((eq, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 rounded-xl border p-4 transition-shadow hover:shadow-md"
                                            >
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 rounded-lg border-2 border-purple-200 object-cover shadow-sm dark:border-purple-800/60"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-purple-200 shadow-sm dark:bg-purple-900/40">
                                                        <Package className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-foreground">{eq.mark}</p>
                                                    <p className="text-sm text-muted-foreground">{eq.reference}</p>
                                                    <p className="text-xs text-muted-foreground">{eq.type_name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{eq.count}</div>
                                                    <p className="text-xs text-muted-foreground">reservations</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalEquipmentPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 border-t pt-3">
                                                <button
                                                    onClick={() => setEquipmentPage((p) => Math.max(1, p - 1))}
                                                    disabled={equipmentPage === 1}
                                                    className="rounded-lg p-2 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-purple-900/30"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {equipmentPage} of {totalEquipmentPages}
                                                </span>
                                                <button
                                                    onClick={() => setEquipmentPage((p) => Math.min(totalEquipmentPages, p + 1))}
                                                    disabled={equipmentPage === totalEquipmentPages}
                                                    className="rounded-lg p-2 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-purple-900/30"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-muted-foreground">No equipment data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Damaged Equipment */}
                    <Card className="bg-light dark:bg-dark">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
                                Damaged Equipment
                                <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-500/20 dark:text-red-300">
                                    {damagedTotal}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(damagedEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(damagedEquipment, damagedPage).map((eq, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 rounded-xl border p-4 transition-shadow hover:shadow-md"
                                            >
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 flex-shrink-0 rounded-lg border-2 border-red-200 object-cover dark:border-red-800/60"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-red-200 shadow-sm dark:bg-red-900/40">
                                                        <Package className="h-8 w-8 text-red-600 dark:text-red-300" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-foreground">{eq.mark}</p>
                                                    <p className="text-sm text-muted-foreground">{eq.reference}</p>
                                                    <p className="text-xs text-muted-foreground">{eq.type_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalDamagedPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 border-t pt-3">
                                                <button
                                                    onClick={() => setDamagedPage((p) => Math.max(1, p - 1))}
                                                    disabled={damagedPage === 1}
                                                    className="rounded-lg p-2 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/30"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {damagedPage} of {totalDamagedPages}
                                                </span>
                                                <button
                                                    onClick={() => setDamagedPage((p) => Math.min(totalDamagedPages, p + 1))}
                                                    disabled={damagedPage === totalDamagedPages}
                                                    className="rounded-lg p-2 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/30"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-muted-foreground">No damaged equipment</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Active Equipment */}
                    <Card className="bg-light dark:bg-dark">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Active Equipment
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                    {activeTotal}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(activeEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(activeEquipment, activePage).map((eq, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-4 transition-shadow hover:shadow-md dark:from-blue-900/20 dark:to-blue-900/10"
                                            >
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 flex-shrink-0 rounded-lg border-2 border-blue-200 object-cover shadow-sm dark:border-blue-800/60"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-blue-200 shadow-sm dark:bg-blue-900/40">
                                                        <Package className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-foreground">{eq.mark}</p>
                                                    <p className="text-sm text-muted-foreground">{eq.reference}</p>
                                                    <p className="text-xs text-muted-foreground">{eq.type_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalActivePages > 1 && (
                                            <div className="flex items-center justify-center gap-2 border-t pt-3">
                                                <button
                                                    onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                                                    disabled={activePage === 1}
                                                    className="rounded-lg p-2 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-900/30"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {activePage} of {totalActivePages}
                                                </span>
                                                <button
                                                    onClick={() => setActivePage((p) => Math.min(totalActivePages, p + 1))}
                                                    disabled={activePage === totalActivePages}
                                                    className="rounded-lg p-2 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue-900/30"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-muted-foreground">No active equipment right now</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Equipment by Type */}
                    <Card className="bg-light dark:bg-dark">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                                    return <p className="py-8 text-center text-muted-foreground">No active equipment data</p>;
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
                    <Card className="bg-light dark:bg-dark">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
                                Most Active Users
                                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-500/20 dark:text-green-300">
                                    {usersTotal}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(topUsers?.length || 0) > 0 ? (
                                    <>
                                        {paginate(topUsers, userPage).map((user, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 rounded-xl border p-4 transition-shadow hover:shadow-md"
                                            >
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        className="h-16 w-16 flex-shrink-0 rounded-full border-2 border-green-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full">
                                                        <span className="text-lg font-bold text-white">
                                                            {user.name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-foreground">
                                                        # {(userPage - 1) * ITEMS_PER_PAGE + index + 1} {user.name}
                                                    </p>
                                                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                                <div className="flex-shrink-0 text-right">
                                                    <div className="text-2xl font-bold text-green-600 dark:text-green-300">{user.count}</div>
                                                    <p className="text-xs text-muted-foreground">reservations</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalUserPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 border-t pt-3">
                                                <button
                                                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                                                    disabled={userPage === 1}
                                                    className="rounded-lg p-2 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-900/30"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {userPage} of {totalUserPages}
                                                </span>
                                                <button
                                                    onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                                                    disabled={userPage === totalUserPages}
                                                    className="rounded-lg p-2 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-900/30"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="py-8 text-center text-muted-foreground">No user data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Slot Statistics */}
                    <Card className="bg-light dark:bg-dark">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Time Slot Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {timeSlotStats.most_reserved && (
                                    <div className="rounded-lg border border-green-200 p-4 dark:border-green-800/50">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-semibold text-dark dark:text-light">Most Reserved Time:</span>
                                            <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                {timeSlotStats.most_reserved.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-dark dark:text-light">{timeSlotStats.most_reserved.count} reservations</p>
                                    </div>
                                )}

                                {timeSlotStats.least_reserved && (
                                    <div className="rounded-lg border border-orange-200 p-4 dark:border-orange-800/50">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-semibold text-dark dark:text-light">Least Reserved Time:</span>
                                            <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                                {timeSlotStats.least_reserved.time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-dark dark:text-light">{timeSlotStats.least_reserved.count} reservations</p>
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
