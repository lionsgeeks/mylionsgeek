import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Users, Clock, Play, LogOut, QrCode, Copy, Check } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function GeekoLobby({ session, participant, participantsCount }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [liveData, setLiveData] = useState({
        participants_count: participantsCount,
        session_status: session.status
    });
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sessionUrl, setSessionUrl] = useState('');

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Generate session control URL
    useEffect(() => {
        if (session && session.geeko && session.geeko.formation) {
            const url = `${window.location.origin}/training/${session.geeko.formation.id}/geeko/${session.geeko.id}/session/${session.id}/control`;
            setSessionUrl(url);
        }
    }, [session]);

    // Poll for live updates
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/geeko/play/${session.id}/live-data`);
                const data = await response.json();
                setLiveData(data);
                
                // Redirect if game started
                if (data.session_status === 'in_progress') {
                    router.visit(`/geeko/play/${session.id}/question`);
                }
            } catch (error) {
                console.error('Failed to fetch live data:', error);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [session.id]);

    const handleLeave = () => {
        router.post(`/geeko/play/${session.id}/leave`);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(sessionUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <AppLayout>
            <Head title={`Lobby - ${session.geeko.title}`} />

            <div className="min-h-screen bg-gradient-to-br from-alpha/5 to-transparent dark:from-alpha/10 dark:to-transparent flex items-center justify-center p-6">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        {/* <div className="w-24 h-24 mx-auto mb-6 rounded-2xl backdrop-blur bg-white/50 dark:bg-dark/40 border border-white/20 flex items-center justify-center text-2xl font-bold text-alpha shadow">
                            QUIZ
                        </div> */}
                        {/* <h1 className="text-4xl font-extrabold text-dark dark:text-light mb-2">
                            {session.geeko.title}
                        </h1> */}
                      {/* Waiting Animation */}
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-3 h-3 bg-alpha rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-alpha rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-3 h-3 bg-alpha rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <p className="text-lg text-dark/70 dark:text-light/70">
                            Waiting for instructor to start the game...
                        </p>
                        {/* <p className="text-sm text-dark/50 dark:text-light/50 mt-2">
                            Current time: {formatTime(currentTime)}
                        </p> */}
                    </div>
                        
                       
                    </div>

                    {/* Status Cards */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 text-center">
                            <Users className="mx-auto text-alpha mb-3" size={32} />
                            <div className="text-3xl font-bold text-dark dark:text-light mb-2">
                                {liveData.participants_count}
                            </div>
                            <div className="text-dark/70 dark:text-light/70 font-semibold">Players Joined</div>
                        </div>
                        
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 text-center">
                            <Play className="mx-auto text-alpha mb-3" size={32} />
                            <div className="text-3xl font-bold text-dark dark:text-light mb-2">
                                {session.geeko.questions?.length || 0}
                            </div>
                            <div className="text-dark/70 dark:text-light/70 font-semibold">Questions</div>
                        </div>
                        
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 text-center">
                            <Clock className="mx-auto text-alpha mb-3" size={32} />
                            <div className="text-3xl font-bold text-dark dark:text-light mb-2">
                                {session.geeko.time_limit}s
                            </div>
                            <div className="text-dark/70 dark:text-light/70 font-semibold">Per Question</div>
                        </div>
                    </div> */}

                    {/* Player Info */}
                    <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-8 mb-8 text-center shadow-xl">
                        <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">
                            You're In!
                        </h2>
                        <div className="flex items-center justify-center space-x-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-alpha text-dark flex items-center justify-center font-bold text-2xl">
                                {participant.nickname.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left">
                                <p className="text-xl font-bold text-dark dark:text-light">
                                    {participant.nickname}
                                </p>
                                <p className="text-dark/70 dark:text-light/70">
                                    Ready to play!
                                </p>
                            </div>
                        </div>
                        
                        <div className="backdrop-blur bg-good/10 border border-good/20 rounded-xl p-4">
                            <p className="text-good font-semibold">
                                Connected and waiting for instructor to start the game
                            </p>
                        </div>
                    </div>

                    {/* Participants List */}
                    {/* {session.participants && session.participants.length > 0 && (
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-6 mb-8">
                            <h3 className="text-lg font-bold text-dark dark:text-light mb-4 text-center">
                                Other Players ({session.participants.length - 1})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {session.participants
                                    .filter(p => p.id !== participant.id)
                                    .map(p => (
                                        <div key={p.id} className="flex items-center space-x-3 bg-alpha/5 rounded-lg p-3">
                                            <div className="w-8 h-8 rounded-full bg-alpha text-dark flex items-center justify-center font-bold text-sm">
                                                {p.nickname.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-dark dark:text-light truncate">
                                                {p.nickname}
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )} */}

                  

                 

                    {/* Instructions */}
                    {/* <div className="backdrop-blur-xl bg-white/60 dark:bg-dark/50 border border-white/20 rounded-2xl p-6 mb-8 shadow">
                        <h3 className="text-lg font-bold text-dark dark:text-light mb-4 text-center">
                            How to Play
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark/70 dark:text-light/70">
                            <div className="flex items-start space-x-3">
                                <span>Answer questions as quickly as possible for more points</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span>Compete with your classmates for the top score</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span>Each question has a time limit - don't wait too long!</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span>Keep this window open and stay connected</span>
                            </div>
                        </div>
                    </div> */}

                    {/* Leave Button */}
                    <div className="text-center">
                        <button
                            onClick={handleLeave}
                            className="inline-flex items-center space-x-2 border border-error/30 text-error px-6 py-3 rounded-xl hover:bg-error/10 transition-colors font-semibold"
                        >
                            <LogOut size={16} />
                            <span>Leave Game</span>
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

