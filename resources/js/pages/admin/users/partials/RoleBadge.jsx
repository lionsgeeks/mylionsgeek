const RoleBadge = ({ role }) => {
  const roleColors = {
    // admin: { cercle: 'bg-red-700', border: 'border-red-500/20', text: 'text-red-600/90' },
    student: { cercle: 'bg-green-700', border: 'border-green-500/20', text: 'text-green-600/90' },
    graduated: { cercle: 'bg-[#FFC801]', border: 'border-[#FFC801]/20', text: 'text-[#FFC801]' }
  };

  const colors = roleColors[role?.toLowerCase()] || roleColors.default;

  return (
    <span
      className={`inline-flex items-center text-md font-medium ${colors.text}`}
    >
      <span 
        className={`w-2 h-2 rounded-full mr-2 ${colors.cercle}`}
      ></span>
      {role}
    </span>
  );
};

export default RoleBadge;
