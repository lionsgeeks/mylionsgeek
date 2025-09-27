import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Crown, 
  Search, 
  Filter, 
  Award, 
  RefreshCw, 
  Moon, 
  Sun, 
  Trophy, 
  Medal, 
  Star,
  Clock,
  Code,
  TrendingUp,
  Users,
  Calendar,
  ChevronDown,
  X,
  Eye,
  Zap,
  Target,
  BarChart3,
  Activity,
  Flame,
  Sparkles,
  CheckCircle,
  XCircle,
  Info,
  Crown as CrownIcon,
  Medal as MedalIcon,
  Award as AwardIcon,
  Monitor,
  Laptop,
  Smartphone
} from "lucide-react";
import { TableRowSkeleton, PodiumSkeleton, LoadingSpinner, LoadingOverlay } from '@/components/LoadingSkeleton';
import { NoResults } from '@/components/NoResults';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [topWinners, setTopWinners] = useState([]);
  const [filter, setFilter] = useState("alltime");
  const [searchText, setSearchText] = useState("");
  const [selectedPromo, setSelectedPromo] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [userInsights, setUserInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    totalCoders: 0,
    totalHours: 0,
    averageTime: 0,
    lastUpdated: null
  });


  const fetchLeaderboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams({
        range: filter,
        promo: selectedPromo,
        search: searchText,
        insights: 'true'
      });
      
      const res = await fetch(`/leaderboard/data?${params}`);
      const data = await res.json();
      
      setLeaderboardData(data.data || []);
      setStats({
        totalCoders: data.stats?.total_users || 0,
        totalHours: data.stats?.total_hours || 0,
        averageTime: data.stats?.average_hours || 0,
        lastUpdated: data.last_updated
      });
      
      showNotification('Leaderboard updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to fetch leaderboard data', err);
      showNotification('Failed to update leaderboard data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [filter, selectedPromo, searchText]);

  const fetchTopWinners = useCallback(async () => {
    try {
      const res = await fetch('/leaderboard/weekly-winners');
      const data = await res.json();
      setTopWinners(data.winners || []);
    } catch (err) {
      console.error('Failed to fetch weekly winners', err);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
    fetchTopWinners();
  }, [fetchLeaderboardData, fetchTopWinners]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showSidePanel) {
        closeSidePanel();
      }
      if (event.key === 'r' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        fetchLeaderboardData();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSidePanel, fetchLeaderboardData]);

  const formatTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const formatHours = (hours) => {
    if (!hours) return '0h';
    return `${Math.round(hours)}h`;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-alpha" />;
      default: return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank) => {
    if (rank <= 3) return "Challenger";
    if (rank <= 10) return "Grandmaster";
    if (rank <= 25) return "Master";
    if (rank <= 50) return "Diamond";
    return "Gold";
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200";
    if (rank <= 10) return "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200";
    if (rank <= 25) return "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-200";
    if (rank <= 50) return "bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 text-cyan-800 dark:text-cyan-200";
    return "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-800 dark:text-orange-200";
  };

  const fetchUserInsights = useCallback(async (user) => {
    if (!user.user?.wakatime_api_key) return;
    
    setLoadingInsights(true);
    try {
      const insights = await Promise.all([
        // Best day insight
        fetch(`https://wakatime.com/api/v1/users/current/insights/best_day?range=${filter}`, {
          headers: { 'Authorization': 'Basic ' + btoa(user.user.wakatime_api_key + ':') }
        }).then(res => res.json()).catch(() => null),
        
        // Daily average insight
        fetch(`https://wakatime.com/api/v1/users/current/insights/daily_average?range=${filter}`, {
          headers: { 'Authorization': 'Basic ' + btoa(user.user.wakatime_api_key + ':') }
        }).then(res => res.json()).catch(() => null),
        
        // Languages insight
        fetch(`https://wakatime.com/api/v1/users/current/insights/languages?range=${filter}`, {
          headers: { 'Authorization': 'Basic ' + btoa(user.user.wakatime_api_key + ':') }
        }).then(res => res.json()).catch(() => null),
        
        // Projects insight
        fetch(`https://wakatime.com/api/v1/users/current/insights/projects?range=${filter}`, {
          headers: { 'Authorization': 'Basic ' + btoa(user.user.wakatime_api_key + ':') }
        }).then(res => res.json()).catch(() => null)
      ]);
      
      setUserInsights({
        bestDay: insights[0],
        dailyAverage: insights[1],
        languages: insights[2],
        projects: insights[3]
      });
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  }, [filter]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowSidePanel(true);
    fetchUserInsights(user);
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedUser(null);
    setUserInsights(null);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const availablePromos = useMemo(() => {
    const promos = [...new Set(leaderboardData.map(user => user.user?.promo))].filter(Boolean);
    return promos.sort((a, b) => b.localeCompare(a));
  }, [leaderboardData]);

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-alpha/30 text-alpha font-semibold">$1</mark>');
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'leaderboard', href: "/students/leaderboard" }]}>
      <Head title="Wakatime Leaderboard" />
      
      {/* Main Container with Enhanced Design */}
      <div className="min-h-screen bg-gradient-to-br from-light to-light/80 dark:from-dark dark:to-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <div className="text-left">
                   <h1 className="text-5xl font-bold text-alpha mb-2">
                    🏆 Wakatime Leaderboard 🏆
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Track coding activity and compete with peers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchLeaderboardData}
                  disabled={isRefreshing}
                   className="flex items-center gap-3 px-6 py-3 bg-alpha text-white rounded-xl hover:bg-alpha/80 disabled:opacity-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Podium Display - Redesigned */}
          {topWinners.length > 0 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                 <h2 className="text-3xl font-bold text-alpha mb-2">
                  🏆 Champions Podium 🏆
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Top performers this week</p>
              </div>
              
              {isRefreshing ? (
                <PodiumSkeleton />
              ) : (
                <div className="relative flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 max-w-6xl mx-auto">
                  {/* 2nd Place */}
                  {topWinners[1] && (
                     <div 
                       className="w-full sm:w-80 bg-white/80 dark:bg-dark/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group relative podium-card border border-alpha/20 dark:border-alpha/30"
                       onClick={() => handleUserClick(topWinners[1])}
                       style={{ height: '280px' }}
                     >
                      {/* Silver Medal */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
                          <MedalIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Rank */}
                      <div className="text-center mb-4 pt-4">
                        <div className="text-4xl font-bold text-gray-600 dark:text-gray-400 mb-2">2</div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full inline-block">
                          {getRankBadge(2)}
                        </div>
                      </div>
                      
                      {/* Avatar */}
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg">
                          {topWinners[1].user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      </div>
                      
                      {/* Name */}
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          {topWinners[1].user?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {topWinners[1].user?.promo ? `Promo ${topWinners[1].user.promo}` : 'No Promo'}
                        </p>
                      </div>
                      
                       {/* Stats */}
                       <div className="text-center">
                         <div className="text-lg font-bold text-alpha">
                           {formatTime(topWinners[1].data?.data?.total_seconds || 0)}
                         </div>
                         <div className="text-sm text-dark/70 dark:text-light/70">
                           Daily: {formatTime(topWinners[1].data?.data?.daily_average || 0)}
                         </div>
                       </div>
                    </div>
                  )}
                  
                  {/* 1st Place - Center and Tallest */}
                  {topWinners[0] && (
                     <div 
                       className="w-full sm:w-80 bg-gradient-to-br from-alpha/10 to-alpha/5 dark:from-alpha/20 dark:to-alpha/10 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 cursor-pointer group relative order-first sm:order-none podium-card podium-winner border border-alpha/30 dark:border-alpha/40"
                       onClick={() => handleUserClick(topWinners[0])}
                       style={{ height: '320px' }}
                     >
                      {/* Crown */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="w-16 h-16 bg-alpha rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                          <CrownIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                       {/* Rank */}
                       <div className="text-center mb-4 pt-6">
                         <div className="text-5xl font-bold text-alpha mb-2">1</div>
                         <div className="text-sm font-medium text-alpha bg-alpha/20 px-3 py-1 rounded-full inline-block">
                           {getRankBadge(1)}
                         </div>
                       </div>
                      
                      {/* Avatar */}
                      <div className="text-center mb-4">
                        <div className="w-24 h-24 bg-alpha rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl ring-4 ring-alpha/30">
                          {topWinners[0].user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      </div>
                      
                      {/* Name */}
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-1">
                          {topWinners[0].user?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {topWinners[0].user?.promo ? `Promo ${topWinners[0].user.promo}` : 'No Promo'}
                        </p>
                      </div>
                      
                       {/* Stats */}
                       <div className="text-center">
                         <div className="text-xl font-bold text-alpha">
                           {formatTime(topWinners[0].data?.data?.total_seconds || 0)}
                         </div>
                         <div className="text-sm text-dark/70 dark:text-light/70">
                           Daily: {formatTime(topWinners[0].data?.data?.daily_average || 0)}
                         </div>
                       </div>
                    </div>
                  )}
                  
                  {/* 3rd Place */}
                  {topWinners[2] && (
                     <div 
                       className="w-full sm:w-80 bg-white/80 dark:bg-dark/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group relative podium-card border border-alpha/20 dark:border-alpha/30"
                       onClick={() => handleUserClick(topWinners[2])}
                       style={{ height: '240px' }}
                     >
                      {/* Bronze Medal */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="w-12 h-12 bg-alpha/80 rounded-full flex items-center justify-center shadow-lg">
                          <AwardIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                       {/* Rank */}
                       <div className="text-center mb-4 pt-4">
                         <div className="text-4xl font-bold text-alpha mb-2">3</div>
                         <div className="text-sm font-medium text-alpha bg-alpha/20 px-3 py-1 rounded-full inline-block">
                           {getRankBadge(3)}
                         </div>
                       </div>
                      
                      {/* Avatar */}
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-alpha/80 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg">
                          {topWinners[2].user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      </div>
                      
                      {/* Name */}
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                          {topWinners[2].user?.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {topWinners[2].user?.promo ? `Promo ${topWinners[2].user.promo}` : 'No Promo'}
                        </p>
                      </div>
                      
                       {/* Stats */}
                       <div className="text-center">
                         <div className="text-lg font-bold text-alpha">
                           {formatTime(topWinners[2].data?.data?.total_seconds || 0)}
                         </div>
                         <div className="text-sm text-dark/70 dark:text-light/70">
                           Daily: {formatTime(topWinners[2].data?.data?.daily_average || 0)}
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats Bar */}
          {/* <div className="bg-gradient-to-r from-alpha/10 to-alpha/5 dark:from-alpha/20 dark:to-alpha/10 rounded-xl p-4 mb-6 fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-alpha">{stats.totalCoders}</div>
                  <div className="text-sm text-dark/70 dark:text-light/70">Active Coders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalHours}h</div>
                  <div className="text-sm text-dark/70 dark:text-light/70">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.averageTime}h</div>
                  <div className="text-sm text-dark/70 dark:text-light/70">Avg per Coder</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {leaderboardData[0]?.user?.name?.split(' ')[0] || 'None'}
                  </div>
                  <div className="text-sm text-dark/70 dark:text-light/70">Top Performer</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-dark/70 dark:text-light/70">
                <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
                <span>Live Data</span>
                <span className="text-xs text-dark/50 dark:text-light/50">Press Ctrl+R to refresh</span>
              </div>
            </div>
          </div> */}

          {/* Enhanced Filters Section */}
           <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-sm rounded-2xl shadow-xl border border-alpha/20 dark:border-alpha/30 p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                {/* Time Range Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                     className="pl-10 pr-8 py-3 rounded-xl border border-alpha/20 dark:border-alpha/30 bg-white dark:bg-dark_gray text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-transparent transition-all duration-200 shadow-sm"
                  >
                    <option value="alltime">All Time</option>
                    <option value="month">This Month</option>
                    <option value="week">This Week</option>
                    <option value="daily">Today</option>
                  </select>
                </div>

                {/* Promo Filter */}
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                  <select
                    value={selectedPromo}
                    onChange={(e) => setSelectedPromo(e.target.value)}
                     className="pl-10 pr-8 py-3 rounded-xl border border-alpha/20 dark:border-alpha/30 bg-white dark:bg-dark_gray text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-transparent transition-all duration-200 shadow-sm"
                  >
                    <option value="all">All Promotions</option>
                    {availablePromos.map(promo => (
                      <option key={promo} value={promo}>Promo {promo}</option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                     className="pl-10 pr-4 py-3 rounded-xl border border-alpha/20 dark:border-alpha/30 bg-white dark:bg-dark_gray text-dark dark:text-light focus:ring-2 focus:ring-alpha focus:border-transparent transition-all duration-200 w-64 shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {leaderboardData.length} coders
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Leaderboard Table */}
          <div className="w-full">
             <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-sm rounded-2xl shadow-xl border border-alpha/20 dark:border-alpha/30 overflow-hidden">
              <div className="px-6 py-5 border-b border-alpha/20 dark:border-alpha/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-dark dark:text-light">Leaderboard</h3>
                  <div className="flex items-center gap-2 text-sm text-dark/70 dark:text-light/70">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Updating...' : 'Live'}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-alpha/10 to-alpha/5 dark:from-alpha/20 dark:to-alpha/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Place</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Player Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Total Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Daily Avg</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Consistency</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Top Language</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-dark dark:text-light">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-alpha/20 dark:divide-alpha/20">
                    {isRefreshing ? (
                      <>
                        {[...Array(8)].map((_, index) => (
                          <TableRowSkeleton key={index} />
                        ))}
                      </>
                    ) : leaderboardData.length > 0 ? (
                      leaderboardData.map((user, index) => (
                        <tr 
                          key={user.user?.id || index} 
                           className="hover:bg-alpha/5 dark:hover:bg-alpha/10 transition-all duration-200 cursor-pointer group table-row"
                          onClick={() => handleUserClick(user)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {getRankIcon(user.metrics?.rank || index + 1)}
                              <span className="text-lg font-bold text-dark dark:text-light">
                                {user.metrics?.rank || index + 1}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-alpha rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {user.user?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                 <div 
                                   className="font-semibold text-dark dark:text-light text-lg"
                                   dangerouslySetInnerHTML={{
                                     __html: highlightText(user.user?.name || 'Unknown', searchText)
                                   }}
                                 />
                                 <div className="text-sm text-dark/70 dark:text-light/70">
                                   {user.user?.promo ? `Promo ${user.user.promo}` : 'No Promo'}
                                 </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 shadow-sm">
                              <Clock className="w-4 h-4" />
                              {formatTime(user.data?.total_seconds || 0)}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-200 shadow-sm">
                              <TrendingUp className="w-4 h-4" />
                              {formatTime(user.data?.daily_average || 0)}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-20 progress-container bg-light/50 dark:bg-dark/50 h-3 shadow-inner">
                                 <div 
                                   className="h-3 progress-fill bg-gradient-to-r from-alpha to-alpha/80"
                                   style={{ width: `${Math.min(100, user.metrics?.win_rate || 0)}%` }}
                                 ></div>
                               </div>
                               <span className="text-sm font-bold text-dark dark:text-light min-w-[3rem]">
                                 {user.metrics?.win_rate || 0}%
                               </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-alpha/20 text-alpha shadow-sm">
                              <Code className="w-4 h-4" />
                              {user.data?.languages?.[0]?.name || 'N/A'}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm rank-badge ${getRankColor(user.metrics?.rank || index + 1)}`}>
                              <Star className="w-4 h-4" />
                              {getRankBadge(user.metrics?.rank || index + 1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <NoResults 
                            searchText={searchText}
                            onClearSearch={() => setSearchText('')}
                            onRefresh={fetchLeaderboardData}
                            type={searchText ? 'search' : 'empty'}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Backdrop Overlay */}
          {showSidePanel && (
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeSidePanel}
            ></div>
          )}

          {/* Fixed Side Panel for User Details */}
          {showSidePanel && selectedUser && (
            <div className="">

            <div  onClick={closeSidePanel}className="bg-black/40 w-screen h-screen fixed top-0 left-0"></div>
            <div className="fixed h-[95%] rounded-lg my-auto  inset-y-0 right-0 w-[25vw] z-50 bg-white/95 dark:bg-dark/95 backdrop-blur-lg shadow-2xl border-l border-alpha/20 dark:border-alpha/30  slide-in-right">
              <div className="h-full overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-dark dark:text-light">Profile Details</h3>
                  <button
                    onClick={closeSidePanel}
                    className="p-2 hover:bg-alpha/10 dark:hover:bg-alpha/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-dark/70 dark:text-light/70" />
                  </button>
                </div>
                
                {/* User Header */}
                <div className="text-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-alpha to-alpha/80 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                      {selectedUser.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    {selectedUser.metrics?.rank <= 3 && (
                      <div className="absolute -top-2 -right-2">
                        {selectedUser.metrics.rank === 1 && <Trophy className="w-6 h-6 text-yellow-500" />}
                        {selectedUser.metrics.rank === 2 && <Medal className="w-6 h-6 text-gray-400" />}
                        {selectedUser.metrics.rank === 3 && <Award className="w-6 h-6 text-amber-600" />}
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl font-semibold text-dark dark:text-light">
                    {selectedUser.user?.name || 'Unknown'}
                  </h4>
                  <p className="text-dark/70 dark:text-light/70">
                    {selectedUser.user?.promo ? `Promo ${selectedUser.user.promo}` : 'No Promo'}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRankColor(selectedUser.metrics?.rank || 1)}`}>
                      <Star className="w-4 h-4" />
                      {getRankBadge(selectedUser.metrics?.rank || 1)}
                    </span>
                    <span className="text-xs text-dark/50 dark:text-light/50">
                      #{selectedUser.metrics?.rank || 1}
                    </span>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-alpha/10 dark:bg-alpha/20 p-4 rounded-lg">
                    <div className="text-sm text-dark/70 dark:text-light/70">Total Time</div>
                    <div className="text-lg font-semibold text-dark dark:text-light">
                      {formatTime(selectedUser.data?.total_seconds || 0)}
                    </div>
                  </div>
                  <div className="bg-alpha/10 dark:bg-alpha/20 p-4 rounded-lg">
                    <div className="text-sm text-dark/70 dark:text-light/70">Daily Average</div>
                    <div className="text-lg font-semibold text-dark dark:text-light">
                      {formatTime(selectedUser.data?.daily_average || 0)}
                    </div>
                  </div>
                </div>
                
                {/* Languages */}
                <div className="mb-6">
                  <div className="text-sm text-dark/70 dark:text-light/70 mb-3">Top Languages</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.data?.languages?.slice(0, 4).map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-gradient-to-r from-alpha/20 to-alpha/10 text-alpha rounded-full text-sm font-medium">
                        {lang.name}
                      </span>
                    )) || <span className="text-dark/50 dark:text-light/50">No data</span>}
                  </div>
        </div>

                {/* Consistency */}
                <div className="mb-6">
                  <div className="text-sm text-dark/70 dark:text-light/70 mb-2">Consistency</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-light/50 dark:bg-dark/50 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-alpha to-alpha/80 progress-bar"
                        style={{ width: `${Math.min(100, selectedUser.metrics?.win_rate || 0)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-dark dark:text-light">
                      {selectedUser.metrics?.win_rate || 0}%
                    </span>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-6">
                  <div className="text-sm text-dark/70 dark:text-light/70 mb-3">Achievements</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-alpha/10 to-alpha/5 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-alpha">{selectedUser.metrics?.languages_count || 0}</div>
                      <div className="text-xs text-dark/70 dark:text-light/70">Languages</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.round(selectedUser.metrics?.total_hours || 0)}h</div>
                      <div className="text-xs text-dark/70 dark:text-light/70">Total Hours</div>
                    </div>
                  </div>
                </div>

                {/* Coding Insights */}
                {loadingInsights ? (
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Loading Insights...</div>
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl animate-pulse">
                          <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : userInsights && (
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-semibold">Coding Insights</div>
                    <div className="space-y-4">
                      {userInsights.bestDay && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Best Day</span>
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {userInsights.bestDay.data?.text || 'No data available'}
                          </div>
                        </div>
                      )}
                      
                      {userInsights.languages && userInsights.languages.data && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Language Distribution</span>
                          </div>
                          <div className="space-y-2">
                            {userInsights.languages.data.slice(0, 4).map((lang, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{lang.name}</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{lang.percent}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {userInsights.projects && userInsights.projects.data && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Top Projects</span>
                          </div>
                          <div className="space-y-2">
                            {userInsights.projects.data.slice(0, 4).map((project, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{project.name}</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(project.total_seconds)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {userInsights.editors && userInsights.editors.data && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Monitor className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Top Editors</span>
                          </div>
                          <div className="space-y-2">
                            {userInsights.editors.data.slice(0, 3).map((editor, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{editor.name}</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(editor.total_seconds)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {userInsights.machines && userInsights.machines.data && (
                        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Laptop className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Machines</span>
                          </div>
                          <div className="space-y-2">
                            {userInsights.machines.data.slice(0, 3).map((machine, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{machine.name}</span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(machine.total_seconds)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Indicators */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-dark/70 dark:text-light/70">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {selectedUser.success ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-dark/70 dark:text-light/70">Member Since</span>
                    <span className="text-xs text-dark dark:text-light">
                      {selectedUser.user?.created_at ? new Date(selectedUser.user.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-dark/70 dark:text-light/70">
          <div className="flex justify-between items-center">
            <div>Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}</div>
            <div className="flex items-center gap-2">
              <span>Data source: WakaTime API</span>
              <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={fetchLeaderboardData}
          disabled={isRefreshing}
           className="bg-alpha hover:bg-alpha/80 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Mobile Profile Modal */}
      {showSidePanel && selectedUser && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50">
          <div className="bg-white/95 dark:bg-dark/95 backdrop-blur-sm rounded-t-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-dark dark:text-light">Profile Details</h3>
                <button
                  onClick={closeSidePanel}
                  className="p-2 hover:bg-alpha/10 dark:hover:bg-alpha/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-dark/70 dark:text-light/70" />
                </button>
              </div>
              
              {/* Mobile User Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-alpha to-alpha/80 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {selectedUser.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <h4 className="text-xl font-semibold text-dark dark:text-light">
                  {selectedUser.user?.name || 'Unknown'}
                </h4>
                <p className="text-dark/70 dark:text-light/70">
                  {selectedUser.user?.promo ? `Promo ${selectedUser.user.promo}` : 'No Promo'}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRankColor(selectedUser.metrics?.rank || 1)}`}>
                    <Star className="w-4 h-4" />
                    {getRankBadge(selectedUser.metrics?.rank || 1)}
                  </span>
                </div>
              </div>
              
              {/* Mobile Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-alpha/10 dark:bg-alpha/20 p-4 rounded-lg">
                  <div className="text-sm text-dark/70 dark:text-light/70">Total Time</div>
                  <div className="text-lg font-semibold text-dark dark:text-light">
                    {formatTime(selectedUser.data?.total_seconds || 0)}
                  </div>
                </div>
                <div className="bg-alpha/10 dark:bg-alpha/20 p-4 rounded-lg">
                  <div className="text-sm text-dark/70 dark:text-light/70">Daily Average</div>
                  <div className="text-lg font-semibold text-dark dark:text-light">
                    {formatTime(selectedUser.data?.daily_average || 0)}
                  </div>
                </div>
              </div>
              
              {/* Mobile Languages */}
              <div className="mb-6">
                <div className="text-sm text-dark/70 dark:text-light/70 mb-3">Top Languages</div>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.data?.languages?.slice(0, 4).map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-gradient-to-r from-alpha/20 to-alpha/10 text-alpha rounded-full text-sm font-medium">
                      {lang.name}
                    </span>
                  )) || <span className="text-dark/50 dark:text-light/50">No data</span>}
                </div>
              </div>
              
              {/* Mobile Consistency */}
              <div className="mb-6">
                <div className="text-sm text-dark/70 dark:text-light/70 mb-2">Consistency</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-light/50 dark:bg-dark/50 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-alpha to-alpha/80 progress-bar"
                      style={{ width: `${Math.min(100, selectedUser.metrics?.win_rate || 0)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-dark dark:text-light">
                    {selectedUser.metrics?.win_rate || 0}%
                  </span>
                </div>
              </div>

              {/* Mobile Achievements */}
              <div className="mb-6">
                <div className="text-sm text-dark/70 dark:text-light/70 mb-3">Achievements</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-alpha/10 to-alpha/5 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-alpha">{selectedUser.metrics?.languages_count || 0}</div>
                    <div className="text-xs text-dark/70 dark:text-light/70">Languages</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(selectedUser.metrics?.total_hours || 0)}h</div>
                    <div className="text-xs text-dark/70 dark:text-light/70">Total Hours</div>
                  </div>
                </div>
              </div>

              {/* Mobile Performance Indicators */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark/70 dark:text-light/70">Rank</span>
                  <span className="font-semibold text-dark dark:text-light">#{selectedUser.metrics?.rank || 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-dark/70 dark:text-light/70">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUser.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {selectedUser.success ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 slide-in-right">
          <div className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border ${
            notification.type === 'success' ? 'bg-green-500/90 text-white border-green-400' :
            notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400' :
            'bg-alpha/90 text-white border-alpha/40'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {notification.type === 'error' && <XCircle className="w-4 h-4" />}
              {notification.type === 'info' && <Info className="w-4 h-4" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
