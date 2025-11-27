import { usePage } from '@inertiajs/react';

const Rolegard = ({ children, authorized = [], except = [] }) => {
    const { auth } = usePage().props;

    // Kanshouf wach roles dyal user array ola la,  ila kanat string kandirha f array b role wa7ed
    const userRoles = Array.isArray(auth?.user?.role)
        ? auth.user.role
        : [auth?.user?.role];

    // Admins can see everything regardless of the following checks
    if (userRoles.includes('admin')) {
        return <>{children}</>;
    }

    // kanakhdo authorized w except bach nkoun mt2akdin blli howma arrays
    const allowedRoles = Array.isArray(authorized) ? authorized : [authorized];
    const excludedRoles = Array.isArray(except) ? except : [except];

    // Ila user 3ndo bzzaf dyal roles, naydo rol wahd ghaykfi ila kan m9bol u ma mchtabkhch f excluded
    const roleCanAccess = userRoles.some((role) => {
        const allowed = allowedRoles.length === 0 || allowedRoles.includes(role);
        const excluded = excludedRoles.includes(role);
        return allowed && !excluded;
    });

    // Ila user m9bol kanreturn children, ila la kanreturn walou
    return <>{roleCanAccess ? children : null}</>;
};

export default Rolegard;



// copyright reserved  l mehdi  forkani   use  this component  o d3iw  m3aya :)
