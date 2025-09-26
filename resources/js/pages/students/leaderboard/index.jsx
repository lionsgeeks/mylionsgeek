import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Crown, Search, Filter, Award, RefreshCw, Moon, Sun } from "lucide-react";

export default function Leaderboard() {
  const [studentsData, setStudentsData] = useState([]);
  const [filter, setFilter] = useState("alltime");
  const [searchText, setSearchText] = useState("");
  const [selectedPromo, setSelectedPromo] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const fetchWakaData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/waka?range=${filter}`);
      const data = await res.json();
      const flattened = data.flatMap(user => user.data || []);
      setStudentsData(flattened);
    } catch (err) {
      console.error('Failed to fetch WakaTime data', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchWakaData();
  }, [fetchWakaData]);

  const formatTime = (seconds) => {
    if (!seconds) return '0 hrs';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs} hrs ${mins} mins`;
  };

  const filteredStudents = useMemo(() => {
    let filtered = studentsData.filter(student => {
      if (selectedPromo !== "all" && student.promo !== selectedPromo) return false;
      if (searchText && !student.username?.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      const timeA = a.totalSeconds ?? a.total_seconds_including_other_language ?? 0;
      const timeB = b.totalSeconds ?? b.total_seconds_including_other_language ?? 0;
      return timeB - timeA;
    });
  }, [studentsData, selectedPromo, searchText]);

  const availablePromos = useMemo(() => {
    const promos = [...new Set(studentsData.map(s => s.promo))].filter(Boolean);
    return promos.sort((a, b) => b.localeCompare(a));
  }, [studentsData]);

  const stats = useMemo(() => {
    const totalSecondsAll = studentsData.reduce((sum, student) => {
      return sum + (student.totalSeconds ?? student.total_seconds_including_other_language ?? 0);
    }, 0);
    const totalHours = Math.round(totalSecondsAll / 3600);
    return {
      totalCoders: studentsData.length,
      totalHours,
      topPerformer: filteredStudents[0]?.username || 'None',
      averageTime: studentsData.length > 0 ? Math.round(totalSecondsAll / studentsData.length / 3600) : 0,
    };
  }, [studentsData, filteredStudents]);

  return (
    <AppLayout breadcrumbs={[{ title: 'leaderboard', href: "/students/leaderboard" }]}>
      <Head title="Leaderboard" />
      <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-black rounded-2xl shadow-lg dark:shadow-gray-800">

        {/* Header + Dark Mode Toggle + Refresh */}
        <div className="mb-8 text-center">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">🏆 Leaderboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-2"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? "Light" : "Dark"}
              </button>
              <button
                onClick={fetchWakaData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{stats.totalCoders}</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-200">Total Coders</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.totalHours}h</div>
              <div className="text-sm text-blue-700 dark:text-blue-200">Total Hours</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.averageTime}h</div>
              <div className="text-sm text-green-700 dark:text-green-200">Avg per Coder</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{stats.topPerformer.split(' ')[0]}</div>
              <div className="text-sm text-purple-700 dark:text-purple-200">Top Performer</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-4 h-4" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-6 py-2 rounded-lg font-medium border border-yellow-500 dark:border-yellow-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <option value="alltime">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="relative">
              <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-4 h-4" />
              <select
                value={selectedPromo}
                onChange={(e) => setSelectedPromo(e.target.value)}
                className="pl-10 pr-8 py-2 rounded-lg border border-yellow-500 dark:border-yellow-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                <option value="all">All Promotions</option>
                {availablePromos.map(promo => (
                  <option key={promo} value={promo}>Promo {promo}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by coder name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-yellow-500 dark:border-yellow-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredStudents.length} of {studentsData.length} coders
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gradient-to-r from-yellow-700 to-yellow-800 dark:from-gray-800 dark:to-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Rank</th>
                <th className="px-6 py-4 text-left font-semibold">Coder</th>
                <th className="px-6 py-4 text-left font-semibold">Total Time</th>
                <th className="px-6 py-4 text-left font-semibold">Daily Avg</th>
                <th className="px-6 py-4 text-left font-semibold">Favorite Language</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                      <span className="text-lg font-black text-yellow-600 dark:text-yellow-300">{index + 1}</span>
                      {index === 0 && <Crown className="w-5 h-5 text-yellow-400 dark:text-yellow-300 fill-current" />}
                    </td>
                    <td className="px-6 py-4">
                      <div className='flex items-center gap-4'>
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-600 dark:to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                          {student.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{student.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                        {formatTime(student.total_seconds_including_other_language)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                        {formatTime(student.daily_average)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                        {student.languages?.[0]?.name || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <div className="text-lg font-semibold">No coders found</div>
                    <div className="text-sm">Try changing your search criteria</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <div>Last updated: {new Date().toLocaleDateString()}</div>
          <div>Data source: WakaTime API</div>
        </div>
      </div>
    </AppLayout>
  );
}
