import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Play, Users, ArrowRight } from 'lucide-react';

export default function JoinGeeko() {
    const { data, setData, post, processing, errors } = useForm({
        session_code: '',
        nickname: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/geeko/join');
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        setData('session_code', value);
    };

    return (
        <AppLayout>
            <Head title="Join Geeko Game" />

            <div className="min-h-screen bg-light dark:bg-dark flex items-center justify-center p-6">
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="text-8xl mb-6">🎯</div>
                        <h1 className="text-4xl font-extrabold text-dark dark:text-light mb-4">
                            Join Geeko Game
                        </h1>
                        <p className="text-lg text-dark/70 dark:text-light/70">
                            Enter the game PIN provided by your instructor
                        </p>
                    </div>

                    {/* Join Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-light dark:bg-dark border border-alpha/20 rounded-2xl p-8 shadow-lg">
                            {/* Game PIN */}
                            <div className="mb-6">
                                <label className="block text-lg font-bold text-dark dark:text-light mb-4 text-center">
                                    Game PIN
                                </label>
                                <input
                                    type="text"
                                    value={data.session_code}
                                    onChange={handleCodeChange}
                                    className="w-full text-center text-3xl font-bold tracking-wider border-2 border-alpha/30 rounded-xl px-6 py-4 bg-light dark:bg-dark text-dark dark:text-light focus:border-alpha focus:ring-4 focus:ring-alpha/20 placeholder-dark/40 dark:placeholder-light/40"
                                    placeholder="XXXXXXXX"
                                    maxLength={8}
                                    required
                                />
                                {errors.session_code && (
                                    <p className="text-error text-center mt-3 font-semibold">{errors.session_code}</p>
                                )}
                                <p className="text-sm text-dark/60 dark:text-light/60 text-center mt-3">
                                    Enter the 8-character game PIN
                                </p>
                            </div>

                            {/* Nickname (Optional) */}
                            <div className="mb-8">
                                <label className="block text-lg font-bold text-dark dark:text-light mb-4 text-center">
                                    Display Name (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={data.nickname}
                                    onChange={(e) => setData('nickname', e.target.value)}
                                    className="w-full text-center text-xl border border-alpha/30 rounded-xl px-6 py-3 bg-light dark:bg-dark text-dark dark:text-light focus:border-alpha focus:ring-2 focus:ring-alpha/20"
                                    placeholder="Your display name"
                                    maxLength={50}
                                />
                                <p className="text-sm text-dark/60 dark:text-light/60 text-center mt-2">
                                    Leave empty to use your real name
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing || data.session_code.length !== 8}
                                className="w-full bg-alpha text-dark text-xl font-bold py-4 px-6 rounded-xl hover:bg-alpha/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-dark border-t-transparent"></div>
                                        <span>Joining...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={24} />
                                        <span>Join Game</span>
                                        <ArrowRight size={24} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Help Section */}
                    <div className="mt-12 text-center">
                        <div className="bg-alpha/10 border border-alpha/20 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-dark dark:text-light mb-4 flex items-center justify-center space-x-2">
                                <Users size={20} />
                                <span>How to Join</span>
                            </h3>
                            <div className="space-y-3 text-sm text-dark/70 dark:text-light/70">
                                <div className="flex items-start space-x-3">
                                    <span className="text-alpha font-bold text-lg">1</span>
                                    <span>Get the 8-character game PIN from your instructor</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="text-alpha font-bold text-lg">2</span>
                                    <span>Enter the PIN in the field above</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="text-alpha font-bold text-lg">3</span>
                                    <span>Optionally choose a display name</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <span className="text-alpha font-bold text-lg">4</span>
                                    <span>Click "Join Game" and wait for the game to start!</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-dark/50 dark:text-light/50">
                            🔒 You can only join games from trainings you're enrolled in
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

