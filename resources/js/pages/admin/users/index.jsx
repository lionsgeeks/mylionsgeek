import { useEffect, useMemo, useState } from "react";
import AppLayout from '@/layouts/app-layout';
import FilterPart from "./partials/FilterPart";
import UsersTable from "./partials/UsersTable";
import Header from "./partials/Header";

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
    const allRoles = [...new Set(users.map((user) => user.role))]
    // console.log(users);
    useEffect(() => {
        const alltrainingPromotion = trainings.filter(t => t.name.toLowerCase().includes('promo'));

        const promotionTitles = alltrainingPromotion.map(p => {
            return p.name.slice(
                p.name.toLowerCase().indexOf('promo'),
                p.name.toLowerCase().indexOf('(')
            ).trim();
        });
        const allPromotion = [...new Set(promotionTitles)]

        setAllPromo(allPromotion)
    }, []);
    console.log(trainings);


    const filteredUsers = useMemo(() => {
        // Get training IDs matching promo filter if promo filter active
        const promoTrainingIds = filters.promo === null
            ? null
            : trainings
                .filter(t => t.name.toLowerCase().includes(filters.promo.toLowerCase()))
                .map(t => t.id);

        const list = users
            .filter(user => user.name?.toLowerCase().includes(filters.search.toLowerCase()))
            .filter(user => filters.training === null ? true : user.formation_id === filters.training)
            .filter(user => {
                if (promoTrainingIds === null) return true;
                return promoTrainingIds.includes(user.formation_id);
            })
            .filter(user => (user.role || "").toLowerCase().includes(filters.role.toLowerCase()))
            .filter(user => (user.status || "").toLowerCase().includes(filters.status.toLowerCase()))
            .sort((a, b) => {
                if (filters.date === "oldest") {
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        return list;
    }, [users, filters, trainings]);

    const allStatus = [...new Set(users.map((user) => user.status))]
    // console.log(status);
    // console.log(filteredUsers.length);


    return (
        <AppLayout>
            <div className="p-10 flex flex-col gap-10">
                <Header trainings={trainings} members={users.length} roles={allRoles} status={allStatus} />
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