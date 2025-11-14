import { useEffect, useMemo, useState } from "react";
import AppLayout from '@/layouts/app-layout';
import FilterPart from "./partials/FilterPart";
import UsersTable from "./partials/UsersTable";
import Header from "./partials/Header";
import Banner from '@/components/banner'
import students from "../../../../../public/assets/images/banner/students.png"

const Users = ({ users, trainings }) => {
    const [allPromo, setAllPromo] = useState([])
    const [filters, setFilters] = useState({
        search: "",
        training: null,
        promo: null,
        role: "",
        status: "",
        date: ""
    });

    // Flatten roles array for all users
    const allRoles = [
        ...new Set(
            users.flatMap(user => Array.isArray(user.role) ? user.role : [user.role])
        )
    ];

    useEffect(() => {
        const alltrainingPromotion = trainings.filter(t => t.name.toLowerCase().includes('promo'));


        const promotionTitles = alltrainingPromotion.map(p => {
            return p.name.slice(
                p.name.toLowerCase().indexOf('promo'),
                p.name.search(/\d/) + 1
            ).trim();
        });
        const allPromotion = [...new Set(promotionTitles)]
        setAllPromo(allPromotion)
    }, []);
    const filteredUsers = useMemo(() => {
        const promoTrainingIds = filters.promo === null
            ? null
            : trainings
                .filter(t => filters.promo != null && t.name.toLowerCase().includes(filters.promo.toLowerCase()))
                .map(t => t.id);

        const list = users
            .filter(user => user.name?.toLowerCase().includes(filters.search.toLowerCase()))
            .filter(user => filters.training === null ? true : user.formation_id === filters.training)
            .filter(user => {
                if (promoTrainingIds === null) return true;
                return promoTrainingIds.includes(user.formation_id);
            })
            .filter(user => {
                if (!filters.role) return true;
                const roles = Array.isArray(user.role) ? user.role : [user.role];
                return roles.some(r => r.toLowerCase().includes(filters.role.toLowerCase()));
            })
            .filter(user => filters.status != null && (user.status || "").toLowerCase().includes(filters.status.toLowerCase()))
            .sort((a, b) => {
                if (filters.date === "oldest") {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        return list;
    }, [users, filters, trainings]);

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
                    filteredUsers={filteredUsers}
                />
                <UsersTable users={filteredUsers} filters={filters} roles={allRoles} trainings={trainings} status={allStatus} />
            </div>
        </AppLayout>
    );
};

export default Users;
