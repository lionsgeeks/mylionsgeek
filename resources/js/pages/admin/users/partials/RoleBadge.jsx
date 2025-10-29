const RoleBadge = ({ role }) => {
  const roleColors = {
    admin: { cercle: 'bg-red-700', border: 'border-red-500/20', text: 'text-red-600/90' },
    student: { cercle: 'bg-green-700', border: 'border-green-500/20', text: 'text-green-600/90' },
    graduated: { cercle: 'bg-[#FFC801]', border: 'border-[#FFC801]/20', text: 'text-[#FFC801]' },
    default: { cercle: 'bg-gray-300', border: 'border-gray-200/20', text: 'text-gray-500' }
  };

  // Ensure role is always an array
  const rolesArray = Array.isArray(role) ? role : [role];

  return (
    <div className="flex gap-2">
      {rolesArray.map((r) => {
        const colors = roleColors[r?.toLowerCase()] || roleColors.default;

        return (
          <span
            key={r}
            className={`inline-flex items-center text-md font-medium ${colors.text}`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${colors.cercle}`}></span>
            {r}
          </span>
        );
      })}
    </div>
  );
};

export default RoleBadge;
