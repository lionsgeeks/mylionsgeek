const forcedRoles = {
    'aymenboujjar12@gmail.com': ['pro'],
    'forkanimahdi@gmail.com': ['coach'],
};

const formatRole = (value) => (value === 'studio_responsable' ? 'Responsable Studio' : value);

const RoleBadge = ({ role, email }) => {
    const roleColors = {
        admin: { cercle: 'bg-red-700', border: 'border-red-500/20', text: 'text-red-600/90' },
        student: { cercle: 'bg-green-700', border: 'border-green-500/20', text: 'text-green-600/90' },
        graduated: { cercle: 'bg-[#FFC801]', border: 'border-[#FFC801]/20', text: 'text-[#FFC801]' },
        pro: { cercle: 'bg-purple-600', border: 'border-purple-500/20', text: 'text-purple-500' },
        coach: { cercle: 'bg-blue-600', border: 'border-blue-500/20', text: 'text-blue-500' },
        default: { cercle: 'bg-gray-300', border: 'border-gray-200/20', text: 'text-gray-500' },
    };

    const deriveRoles = () => {
        const forced = email ? forcedRoles[email.toLowerCase()] : null;
        if (forced) return forced;
        if (!role) return [];
        if (Array.isArray(role)) return role.filter(Boolean);
        return [role];
    };

    const rolesArray = deriveRoles();

    return (
        <div className="flex gap-2">
            {rolesArray.map((r) => {
                const normalized = r?.toLowerCase();
                const colors = roleColors[normalized] || roleColors.default;

                return (
                    <span key={`${email || ''}-${r}`} className={`text-md inline-flex items-center font-medium ${colors.text}`}>
                        <span className={`mr-2 h-2 w-2 rounded-full ${colors.cercle}`}></span>
                        {formatRole(r)}
                    </span>
                );
            })}
        </div>
    );
};

export default RoleBadge;
