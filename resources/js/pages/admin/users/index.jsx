import { useMemo, useState } from "react";
import AppLayout from '@/layouts/app-layout';
import FilterPart from "./partials/FilterPart";
import UsersTable from "./partials/UsersTable";
import Header from "./partials/Header";

const Users = ({ users, trainings }) => {
    const [filters, setFilters] = useState({
        search: "",
        training: null,
        role: "",
        status: "",
        date: ""
    });
    const allRoles = [...new Set(users.map((user) => user.role))]
    
    const filteredUsers = useMemo(() => {
        const list = users
            .filter(user => user.name?.toLowerCase().includes(filters.search.toLowerCase()))
            .filter(user => filters.training === null ? true : user.formation_id === filters.training)
            .filter(user => (user.role || "").toLowerCase().includes(filters.role.toLowerCase()))
            .filter(user => (user.status || "").toLowerCase().includes(filters.status.toLowerCase()))
            .sort((a, b) => {
                if (filters.date === "oldest") {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        return list;
    }, [users, filters]);
    const allStatus = [...new Set(users.map((user)=>user.status))]
    // console.log(status);
    
    return (
        <AppLayout>
            <div className="p-10 flex flex-col gap-10">
                <Header allmembers={users.length} />
                <FilterPart
                    filters={filters}
                    setFilters={setFilters}
                    trainings={trainings}
                    status={allStatus}
                    roles={allRoles}
                    filteredUsers={filteredUsers}
                />
                <UsersTable users={filteredUsers} filters={filters} roles={allRoles} trainings={trainings} status={allStatus} />

            </div>
        </AppLayout>
    );
};
export default Users;