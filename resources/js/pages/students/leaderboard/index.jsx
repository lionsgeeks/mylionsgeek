import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Award, RefreshCw, Trophy, Medal, Star, X, CheckCircle, XCircle, Info, Crown as CrownIcon, Medal as MedalIcon, Award as AwardIcon, Monitor, Laptop, Smartphone } from "lucide-react";
import { TableRowSkeleton, PodiumSkeleton, LoadingSpinner, LoadingOverlay } from '@/components/LoadingSkeleton';
import { NoResults } from '@/components/NoResults';
import BoardHeader from './partials/boardHeader';
import BoardPodium from './partials/boardPodium';
import BoardFilter from './partials/boardFilter';
import BoardTable from './partials/boardTable';
import Banner from "@/components/banner"
import illustration from "../../../../../public/assets/images/banner/Winners-amico.png"

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [allLeaderboardData, setAllLeaderboardData] = useState([]); // Store all data for client-side filtering
  const [topWinners, setTopWinners] = useState([]);
  const [filter, setFilter] = useState("this_week");
  const [searchText, setSearchText] = useState("");
  const [selectedPromo, setSelectedPromo] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [userInsights, setUserInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showPreviousModal, setShowPreviousModal] = useState(false);
  const [previousPodium, setPreviousPodium] = useState({ results: [], winners: [], period: null, last_updated: null });
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
        insights: 'true'
      });

      const url = `/leaderboard/data?${params}`;
      //console.log('Fetching leaderboard data from:', url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      //console.log('Leaderboard data received:', data);
      //console.log('Number of users:', data.data?.length || 0);
      
      if (data.data && data.data.length > 0) {
        //console.log('First user data sample:', data.data[0]);
      }

      // Store all data for client-side filtering
      setAllLeaderboardData(data.data || []);
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
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
      showNotification('Failed to update leaderboard data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [filter, selectedPromo]);

  const fetchTopWinners = useCallback(async () => {
    try {
      const res = await fetch('/leaderboard/weekly-winners');
      const data = await res.json();
      setTopWinners(data.winners || []);
    } catch (err) {
      console.error('Failed to fetch weekly winners', err);
    }
  }, []);

  const fetchPreviousWeekPodium = useCallback(async () => {
    try {
      const res = await fetch('/leaderboard/previous-week-podium');
      const data = await res.json();
      setPreviousPodium({
        results: data.results || [],
        winners: data.winners || [],
        period: data.period || null,
        last_updated: data.last_updated || null
      });
      setShowPreviousModal(true);
    } catch (err) {
      console.error('Failed to fetch previous week podium', err);
      showNotification('Failed to load previous week podium', 'error');
    }
  }, []);

  // Real-time search filtering with correct ranking
  const filteredData = useMemo(() => {
    if (!searchText.trim()) {
      return allLeaderboardData;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = allLeaderboardData.filter(item => {
      const userName = item.user?.name?.toLowerCase() || '';
      const userEmail = item.user?.email?.toLowerCase() || '';
      return userName.includes(searchLower) || userEmail.includes(searchLower);
    });

    // Keep original ranks from the full dataset
    return filtered.map(item => ({
      ...item,
      // Keep the original rank from the full leaderboard
      originalRank: item.metrics?.rank || 999
    }));
  }, [allLeaderboardData, searchText]);

  // Update displayed data when search changes
  useEffect(() => {
    setLeaderboardData(filteredData);
  }, [filteredData]);

  useEffect(() => {
    //console.log('Leaderboard component mounted, fetching data...');
    fetchLeaderboardData();
    fetchTopWinners();
  }, [fetchLeaderboardData, fetchTopWinners]);

  // Debug: Log when leaderboardData changes
  useEffect(() => {
    // console.log('Leaderboard data updated:', {
    //   count: leaderboardData.length,
    //   firstUser: leaderboardData[0] || null,
    //   allData: leaderboardData
    // });
  }, [leaderboardData]);

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



  const getRankBadge = (timeInSeconds) => {
    const hours = timeInSeconds / 3600; // convert seconds to hours

    if (hours >= 2000) return "Grand Master";
    if (hours >= 1500) return "Master Elite";
    if (hours >= 1200) return "Master";
    if (hours >= 900) return "Diamond Pro";
    if (hours >= 700) return "Diamond";
    if (hours >= 500) return "Gold Pro";
    if (hours >= 350) return "Gold";
    if (hours >= 200) return "Silver";
    if (hours >= 100) return "Bronze";
    return "Beginner";
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
    return promos.sort((a, b) => {
      const strA = String(a || '');
      const strB = String(b || '');
      return strB.localeCompare(strA);
    });
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
        <div className=" mx-auto p-4 md:p-6 ">

          <Banner
            illustration={illustration}

          />
          
          <BoardPodium
            topWinners={topWinners}
            formatTime={formatTime}
            isRefreshing={isRefreshing}
            getRankBadge={getRankBadge}
            fetchLeaderboardData={fetchLeaderboardData}
            handleUserClick={handleUserClick}
          />

          <BoardHeader
            fetchLeaderboardData={fetchLeaderboardData}
            isRefreshing={isRefreshing}
            fetchPreviousWeekPodium={fetchPreviousWeekPodium}
          />




          <BoardFilter
            filter={filter}
            leaderboardData={leaderboardData}
            searchText={searchText}
            setSearchText={setSearchText}
            availablePromos={availablePromos}
            selectedPromo={selectedPromo}
            setSelectedPromo={setSelectedPromo}
            isRefreshing={isRefreshing}
            setFilter={setFilter}
          />

          <BoardTable
            isRefreshing={isRefreshing}
            leaderboardData={leaderboardData}
            NoResults={NoResults}
            searchText={searchText}
            setSearchText={setSearchText}
            fetchLeaderboardData={fetchLeaderboardData}
            showSidePanel={showSidePanel}
            getRankIcon={getRankIcon}
            highlightText={highlightText}
            selectedUser={selectedUser}
            closeSidePanel={closeSidePanel}
            formatTime={formatTime}
            getRankBadge={getRankBadge}
            loadingInsights={loadingInsights}
            userInsights={userInsights}
            handleUserClick={handleUserClick}
            getRankColor={getRankColor}
          />
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-dark/70 dark:text-light/70">
            <div className="flex justify-between items-center">
              <div>Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}</div>

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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
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

      {/* Previous Week Podium Modal */}
      {showPreviousModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-2xl p-0">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Previous Week Podium</h3>
                <button onClick={() => setShowPreviousModal(false)} className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previousPodium.period && (
                <div className="text-sm text-neutral-600 dark:text-neutral-300">
                  {previousPodium.period.start} → {previousPodium.period.end}
                </div>
              )}
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-3">
              {previousPodium.results.length === 0 && (
                <div className="text-neutral-500">No data</div>
              )}
              {previousPodium.results.map((w) => (
                <div key={w.user?.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-alpha/10 text-alpha flex items-center justify-center font-bold">
                      {w.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-medium">{w.user?.name}</div>
                      <div className="text-xs text-neutral-500">{w.user?.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatTime(w.total_seconds)}</div>
                    <div className="text-xs text-neutral-500">Rank #{w.rank}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
              Last updated: {previousPodium.last_updated ? new Date(previousPodium.last_updated).toLocaleString() : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 slide-in-right">
          <div className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border ${notification.type === 'success' ? 'bg-green-500/90 text-white border-green-400' :
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
