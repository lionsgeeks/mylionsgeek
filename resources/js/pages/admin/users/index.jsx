import { useMemo, useState } from "react";
import AppLayout from '@/layouts/app-layout';
import FilterPart from "./partials/FilterPart";
import UsersTable from "./partials/UsersTable";
import Header from "./partials/Header";
import Banner from '@/components/banner'
import students from "../../../../../public/assets/images/banner/students.png"

const defaultFilters = {
    search: "",
    training: null,
    promo: null,
    role: "",
    status: "",
    date: "",
    field: null,
};

const Users = ({ users, trainings }) => {
    const [filters, setFilters] = useState(defaultFilters);

    // Flatten roles array for all users
    const allRoles = [
        ...new Set(
            users.flatMap(user => Array.isArray(user.role) ? user.role : [user.role])
        )
    ];

    const normalizeValue = (value) => {
        if (typeof value === 'string') return value.trim();
        if (value === null || value === undefined) return '';
        return String(value).trim();
    };

    const allPromo = useMemo(() => {
        return [...new Set(
            users
                .map(user => normalizeValue(user.promo))
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
    }, [users]);

    const allFields = useMemo(() => {
        return [...new Set(
            users
                .map(user => normalizeValue(user.field))
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));
    }, [users]);

    const filteredUsers = useMemo(() => {
        const search = filters.search.toLowerCase();
        const roleFilter = filters.role?.toLowerCase() ?? "";
        const statusFilter = filters.status?.toLowerCase() ?? "";
        const promoFilter = filters.promo ? normalizeValue(filters.promo).toLowerCase() : null;
        const fieldFilter = filters.field ? normalizeValue(filters.field).toLowerCase() : null;
        const list = users
            .filter(user => {
                if (!search) return true;
                return (user.name || '').toLowerCase().includes(search);
            })
            .filter(user => filters.training === null ? true : user.formation_id === filters.training)
            .filter(user => {
                if (!promoFilter) return true;
                const userPromo = normalizeValue(user.promo).toLowerCase();
                return userPromo === promoFilter;
            })
            .filter(user => {
                if (!fieldFilter) return true;
                const userField = normalizeValue(user.field).toLowerCase();
                return userField === fieldFilter;
            })
            .filter(user => {
                if (!filters.role) return true;
                const roles = Array.isArray(user.role) ? user.role : [user.role];
                return roles.some(r => r?.toLowerCase().includes(roleFilter));
            })
            .filter(user => {
                if (!statusFilter) return true;
                return (user.status || "").toLowerCase() === statusFilter;
            })
            .sort((a, b) => {
                if (filters.date === "oldest") {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        return list;
    }, [users, filters]);

    const allStatus = [...new Set(users.map((user) => user.status))];

    return (
        <AppLayout>
            <div className="p-6 flex flex-col gap-10">
                <Banner illustration={students} />
                <Header trainings={trainings} filteredUsers={filteredUsers} roles={allRoles} status={allStatus} />
                <FilterPart
                    filters={filters}
                    setFilters={setFilters}
                    trainings={trainings}
                    status={allStatus}
                    roles={allRoles}
                    allPromo={allPromo}
                    fields={allFields}
                    filteredUsers={filteredUsers}
                    initialFilters={defaultFilters}
                />
                <UsersTable users={filteredUsers} filters={filters} roles={allRoles} trainings={trainings} status={allStatus} />
            </div>
        </AppLayout>
    );
};

export default Users;
