import { useState } from 'react';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, Dock, User as UserIcon, Book, LayoutGrid } from 'lucide-react';
import { AddDocumentModal } from './add-document-modal';
import BookAppointment from '@/components/book-appointment';
import Rolegard from './rolegard';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={false} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <Rolegard authorized={['admin', 'responsable_studio', 'coach']}>
                    <DropdownMenuItem asChild>
                        <Link className="block w-full" href="/admin/dashboard" prefetch onClick={cleanup}>
                            <LayoutGrid className="mr-2" />
                            Back to admin
                        </Link>
                    </DropdownMenuItem>
                </Rolegard>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={`/students/${user.id}`} prefetch onClick={cleanup}>
                        <UserIcon className="mr-2" />
                        View Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault();
                        setTimeout(() => {
                            setIsDocModalOpen(true);
                        }, 150);
                    }}
                    className="flex items-center cursor-pointer"
                >
                    <Dock className="mr-2" />
                    Add document
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={(e) => {
                    e.preventDefault();
                    setTimeout(() => {
                        setIsAppointmentModalOpen(true);
                    }, 150);
                }}>
                    <Book className="mr-2" />
                    Book an appointment
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={edit()} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" href={logout()} as="button" onClick={handleLogout} data-test="logout-button">
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>

            {/* Add Document Modal */}
            <AddDocumentModal
                user={user}
                isOpen={isDocModalOpen}
                onClose={() => setIsDocModalOpen(false)}
            />
            <BookAppointment
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                onSuccess={(selectedPerson) => {
                    console.log('Appointment booked with:', selectedPerson);

                }}
            />
        </>
    );
}
