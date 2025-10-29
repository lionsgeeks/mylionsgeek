import Banner from '@/components/banner';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import illustration from '../../../public/assets/images/banner/men.png';
import pattern from '../../../public/assets/images/banner/pattern.png';
import MainDashboard from './admin/dashboard/index';
const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage().props;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* l9aw  liha blasa  */}

                <Banner
                    illustration={illustration}
                    pattern={pattern}
                    description="Easily book, manage and track studio gear and equipment Streamline your studio workflow"
                    title="Welcome to the Dashboard"
                    userName={auth.user.name}
                    greeting="Hi"
                />

                <MainDashboard />
                {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border"> */}

                {/* <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                        initialView="timeGridWeek"         // shows week view with hours
                        // headerToolbar={{
                        //     left: "prev,next today",
                        //     center: "title",
                        //     right: "dayGridMonth,timeGridWeek,timeGridDay", // buttons like in your screenshot
                        // }}
                        allDaySlot={true}                  // shows the "all-day" row
                        slotMinTime="08:00:00"             // earliest hour
                        slotMaxTime="20:00:00"             // latest hour
                        selectable={true}   
                        selectMirror={true}               // allow selecting time slots
                        editable={true}                    // allow drag/drop
                        // events={events}                    // your JS array of events
                        eventClick={(info) => alert(`Event: ${info.event.title}`)}
                        dateClick={(info) => console.log(`Clicked date: ${info.dateStr}`)}
                        height="auto"
                        
                    /> */}

                {/* </div> */}
            </div>
        </AppLayout>
    );
}
