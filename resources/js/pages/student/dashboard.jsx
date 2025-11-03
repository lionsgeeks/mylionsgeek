import React from 'react';
import AppLayout from '@/layouts/app-layout';
import Banner from "@/components/banner"
import illustration from "../../../../public/assets/images/banner/Winners-amico.png"

export default function StudentDashboard() {
    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold">Student Dashboard</h1>
                <Banner
                    illustration={illustration}

                />
            </div>
        </AppLayout>
    );
}



