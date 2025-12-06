import React, { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Clipboard, Mail, Plus, Users2, Camera, Code } from 'lucide-react';
import StatsCard from '../../../../components/StatCard';

import AddUserDialog from './components/AddUserDialog';
import ExportStudentsDialog from './components/ExportStudentsDialog';
import SendEmailDialog from './components/SendEmailDialog';

const Header = ({ message, roles, trainings, filteredUsers }) => {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [copy, setCopy] = useState(true);

    const emailsToCopy = useMemo(() => {
        return filteredUsers?.map(u => u?.email)
            .filter(Boolean)
            .join(", ");
    }, [filteredUsers]);

    const handleCopyEmails = () => {
        if (!emailsToCopy) return;
        navigator.clipboard.writeText(emailsToCopy).then(() => {
            setCopy(false);
            setTimeout(() => setCopy(true), 1500);
        });
    };

    const mediaTraining = trainings.filter(t =>
        t.name.toLowerCase().includes('création') ||
        t.name.toLowerCase().includes('media') ||
        t.name.toLowerCase().includes('creator')
    );

    const codingTraining = trainings.filter(t =>
        t.name.toLowerCase().includes('coding') ||
        t.name.toLowerCase().includes('developpement') ||
        t.name.toLowerCase().includes('developement')
    );

    const mediaStudents = filteredUsers.filter(u =>
        mediaTraining.map(t => t.id).includes(u.formation_id)
    );

    const codingStudents = filteredUsers.filter(u =>
        codingTraining.map(t => t.id).includes(u.formation_id)
    );

    const staticCardData = [
        { title: 'Total Users', value: filteredUsers.length, icon: Users2 },
        { title: 'Total Media Students', value: mediaStudents.length, icon: Camera },
        { title: 'Total Coding Students', value: codingStudents.length, icon: Code },
    ];

    return (
        <>
            <StatsCard statsData={staticCardData} />

            <div className="flex justify-between items-center">
                <div></div>

                <div className="flex items-center gap-3">
                    {/* Copy Emails */}
                    <Button
                        onClick={handleCopyEmails}
                        className="bg-light text-dark border hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
                    >
                        {copy ? <Copy className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copy ? 'Copy Emails' : 'Copied!'}
                    </Button>

                    {/* Export Dialog */}
                    <ExportStudentsDialog
                        open={isExportOpen}
                        setOpen={setIsExportOpen}
                    />

                    <Button
                        className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer px-7 py-4"
                        onClick={() => setIsExportOpen(true)}
                    >
                        Export Students
                    </Button>

                    {/* Add User Dialog */}
                    <AddUserDialog
                        open={isAddUserOpen}
                        setOpen={setIsAddUserOpen}
                        trainings={trainings}
                    />

                    <Button
                        className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer px-7 py-4 flex gap-2"
                        onClick={() => setIsAddUserOpen(true)}
                    >
                        <Plus /> Add User
                    </Button>

                    {/* Send Email Dialog */}
                    <SendEmailDialog
                        open={isEmailOpen}
                        setOpen={setIsEmailOpen}
                        trainings={trainings}
                        filteredUsers={filteredUsers}
                    />

                    <Button
                        onClick={() => setIsEmailOpen(true)}
                        className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer px-7 py-4 flex gap-2"
                    >
                        <Mail /> Send Email
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Header;
