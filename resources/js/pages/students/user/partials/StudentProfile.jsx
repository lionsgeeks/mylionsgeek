import React from 'react';
import AppLayout from '@/layouts/app-layout';
import Header from './components/Header';
import LeftColumn from './components/LeftColumn';
import RightColumn from './components/RightColumn';

const StudentProfile = ({ user }) => {
    console.log(user);
    
    console.log(user);
    const userFunctionality = (user) => {
        if (user.formation.toLowerCase().includes('developpement') ||
            user.formation.toLowerCase().includes('coding')) {
            return 'Full Stack Developer'
        }
        return 'Content Creator'
    }


    return (
        <AppLayout>
            <div className="min-h-screen bg-light dark:bg-dark">
                <div className="max-w-full px-4 py-6">
                    {/* Profile Header Card */}
                    <Header user={user} userFunctionality={userFunctionality} />

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Left Column */}
                        <LeftColumn user={user} />

                        {/* Right Column */}
                        <RightColumn user={user} />

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default StudentProfile;