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

    // Aggregates for small badges
    const studioTotal = (studioReservations || []).reduce((sum, s) => sum + (s.count || 0), 0);
    const topEquipmentTotal = topEquipment?.length || 0;
    const damagedTotal = damagedEquipment?.length || 0;
    const activeTotal = activeEquipment?.length || 0;
    const usersTotal = topUsers?.length || 0;

    return (
        <AppLayout>
            <Head title="Reservation Analytics" />
            
            <div className="px-4 py-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link 
                        href="/admin/reservations" 
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Reservations
                    </Link>
                    
                    <h1 className="text-3xl font-bold text-foreground mb-2">Reservation Analytics & Reporting</h1>
                    <p className="text-muted-foreground">Comprehensive statistics and insights about reservations, studios, equipment, and users</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Studio Reservations Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building2 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                Studio Reservations
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{studioTotal}</span>
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
                                <TrendingUp className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Top Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                                Most Reserved Equipment
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">{topEquipmentTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(topEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(topEquipment, equipmentPage).map((eq, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl hover:shadow-md transition-shadow">
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 object-cover rounded-lg border-2 border-purple-200 dark:border-purple-800/60 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-purple-200 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        <Package className="h-8 w-8 text-purple-600 dark:text-purple-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
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
                                            <div className="flex items-center justify-center gap-2 pt-3 border-t">
                                                <button
                                                    onClick={() => setEquipmentPage(p => Math.max(1, p - 1))}
                                                    disabled={equipmentPage === 1}
                                                    className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {equipmentPage} of {totalEquipmentPages}
                                                </span>
                                                <button
                                                    onClick={() => setEquipmentPage(p => Math.min(totalEquipmentPages, p + 1))}
                                                    disabled={equipmentPage === totalEquipmentPages}
                                                    className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No equipment data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Damaged Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                                Damaged Equipment
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300">{damagedTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(damagedEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(damagedEquipment, damagedPage).map((eq, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl hover:shadow-md transition-shadow">
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 object-cover rounded-lg border-2 border-red-200 dark:border-red-800/60 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-red-200 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        <Package className="h-8 w-8 text-red-600 dark:text-red-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-foreground">{eq.mark}</p>
                                                    <p className="text-sm text-muted-foreground">{eq.reference}</p>
                                                    <p className="text-xs text-muted-foreground">{eq.type_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalDamagedPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-3 border-t">
                                                <button
                                                    onClick={() => setDamagedPage(p => Math.max(1, p - 1))}
                                                    disabled={damagedPage === 1}
                                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {damagedPage} of {totalDamagedPages}
                                                </span>
                                                <button
                                                    onClick={() => setDamagedPage(p => Math.min(totalDamagedPages, p + 1))}
                                                    disabled={damagedPage === totalDamagedPages}
                                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No damaged equipment</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Active Equipment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                    Active Equipment
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{activeTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(activeEquipment?.length || 0) > 0 ? (
                                    <>
                                        {paginate(activeEquipment, activePage).map((eq, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl hover:shadow-md transition-shadow">
                                                {eq.image ? (
                                                    <img
                                                        src={eq.image}
                                                        alt={eq.mark}
                                                        className="h-16 w-16 object-cover rounded-lg border-2 border-blue-200 dark:border-blue-800/60 flex-shrink-0 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-blue-200 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        <Package className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-foreground">{eq.mark}</p>
                                                    <p className="text-sm text-muted-foreground">{eq.reference}</p>
                                                    <p className="text-xs text-muted-foreground">{eq.type_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalActivePages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-3 border-t">
                                                <button
                                                    onClick={() => setActivePage(p => Math.max(1, p - 1))}
                                                    disabled={activePage === 1}
                                                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {activePage} of {totalActivePages}
                                                </span>
                                                <button
                                                    onClick={() => setActivePage(p => Math.min(totalActivePages, p + 1))}
                                                    disabled={activePage === totalActivePages}
                                                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No active equipment right now</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Equipment by Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
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
                                    return <p className="text-muted-foreground text-center py-8">No active equipment data</p>;
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Top Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                                Most Active Users
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300">{usersTotal}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {(topUsers?.length || 0) > 0 ? (
                                    <>
                                        {paginate(topUsers, userPage).map((user, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl hover:shadow-md transition-shadow">
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt={user.name}
                                                        className="h-16 w-16 object-cover rounded-full border-2 border-green-200 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-700 dark:to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-bold text-lg">
                                                            {user.name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-foreground"># {(userPage - 1) * ITEMS_PER_PAGE + index + 1} {user.name}</p>
                                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-2xl font-bold text-green-600 dark:text-green-300">{user.count}</div>
                                                    <p className="text-xs text-muted-foreground">reservations</p>
                                                </div>
                                            </div>
                                        ))}
                                        {totalUserPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-3 border-t">
                                                <button
                                                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                                    disabled={userPage === 1}
                                                    className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-muted-foreground">
                                                    Page {userPage} of {totalUserPages}
                                                </span>
                                                <button
                                                    onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                                                    disabled={userPage === totalUserPages}
                                                    className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No user data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Slot Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                                Time Slot Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {timeSlotStats.most_reserved && (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-green-900 dark:text-green-300">Most Reserved Time:</span>
                                            <span className="text-2xl font-bold text-green-700 dark:text-green-300">{timeSlotStats.most_reserved.time}</span>
                                        </div>
                                        <p className="text-sm text-green-700 dark:text-green-300/90">{timeSlotStats.most_reserved.count} reservations</p>
                                    </div>
                                )}
                                
                                {timeSlotStats.least_reserved && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-orange-900 dark:text-orange-300">Least Reserved Time:</span>
                                            <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">{timeSlotStats.least_reserved.time}</span>
                                        </div>
                                        <p className="text-sm text-orange-700 dark:text-orange-300/90">{timeSlotStats.least_reserved.count} reservations</p>
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

