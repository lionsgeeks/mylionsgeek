import { usePage } from '@inertiajs/react';

const Rolegard = ({ children, authorized = [], except = [] }) => {
    const { auth } = usePage().props;

    // Kanshouf wach roles dyal user array ola la,  ila kanat string kandirha f array b role wa7ed
    const userRoles = Array.isArray(auth?.user?.role)
        ? auth.user.role
        : [auth?.user?.role];

    // kanakhdo authorized w except bach nkoun mt2akdin blli howma arrays
    const allowedRoles = Array.isArray(authorized) ? authorized : [authorized];
    const excludedRoles = Array.isArray(except) ? except : [except];

    // Kanshouf wach user 3ndo chi role mn authorized Ila authorized khawya, kandirha b true bach ay user ykoun m9bol
    const hasAuthorizedRole = allowedRoles.length === 0
        ? true
        : userRoles.some(role => allowedRoles.includes(role));

    // Kanshouf wach user 3ndo chi role mn except
    const hasExcludedRole = userRoles.some(role => excludedRoles.includes(role));

    /* 
    L-logic dyalna:

    - Ila user 3ndo chi role mn authorized → yban children
    - Ila ma3ndnach authorized (khawya) → kolchi yban ghir li roles dyalhom f except ma ybanouch
    - Ila user 3ndo role f authorized w role f except f nafs l wa9t → yban (madam role wa7d  mkhlih idoz idn   iban lih )
    */
    const isAuthorized =
        (hasAuthorizedRole && !(!allowedRoles.length && hasExcludedRole)) ||
        (allowedRoles.length === 0 && !hasExcludedRole);

    // Ila user m9bol kanreturn children, ila la kanreturn walou
    return <>{isAuthorized ? children : null}</>;
};

export default Rolegard;



// copyright reserved  l mehdi  forkani   use  this component  o d3iw  m3aya :)
