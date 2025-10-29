import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function ShowSkippableModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [firstTime, setFirstTime] = useState(true);
    const { reservationStats, auth } = usePage().props;

    const goToReservations = () => {
        router.visit('/admin/reservations');
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        if ((auth.user.role.includes('admin') || auth.user.role.includes('coach')) && window.location.pathname !== '/admin/reservations') {
            const showModal = () => {
                if (reservationStats.reservation.notProcessed > 0 || reservationStats.cowork.notProcessed > 0) {
                    setIsOpen(true);
                }
            };

            if (firstTime) {
                const timer = setTimeout(() => {
                    showModal();
                    setFirstTime(false);
                }, 2000);
                return () => clearTimeout(timer);
            } else {
                // const interval = setInterval(() => {
                //   showModal();
                // }, 60000);
                // return () => clearInterval(interval);
            }
        }
    }, [firstTime, auth.user.role, reservationStats]);

    if (!isOpen) return null;

    // return (
    //   <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    //     <div
    //       className="absolute inset-0 bg-black/60 transition-opacity duration-300"
    //       onClick={handleClose}
    //     />
    //     <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#171717] p-6 shadow-2xl transform transition-transform duration-300 scale-95 animate-fadeIn">
    //       <div className="flex flex-col gap-4">
    //         <div>
    //           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
    //             Vérifier la réservation
    //           </h3>
    //           <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
    //             Please confirm your reservation details before continuing.
    //           </p>
    //         </div>

    //         <div className="text-sm text-red-500 dark:text-red-400 font-medium space-y-1">
    //           {reservationStats.reservation.notProcessed > 0 && (
    //             <p>{reservationStats.reservation.notProcessed} unprocessed reservation(s)</p>
    //           )}

    //           {reservationStats.cowork.notProcessed > 0 && (
    //             <p>{reservationStats.cowork.notProcessed} unprocessed coworking(s))</p>
    //           )}

    //         </div>

    //         <div className="mt-6 flex justify-end gap-3">
    //           <button
    //             onClick={handleClose}
    //             className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    //           >
    //             Annuler
    //           </button>
    //           <button
    //             onClick={goToReservations}
    //             className="flex items-center gap-2 rounded-md border border-[var(--color-alpha)] bg-[var(--color-alpha)] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-transparent hover:text-black dark:hover:text-[var(--color-alpha)]"
    //           >
    //             Go to Reservations Page
    //           </button>
    //         </div>
    //       </div>

    //       <button
    //         onClick={handleClose}
    //         aria-label="Close"
    //         className="absolute right-3 top-3 rounded-md p-1 text-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-white transition-colors"
    //       >
    //         <X size={20} />
    //       </button>
    //     </div>
    //   </div>
    // );
}
