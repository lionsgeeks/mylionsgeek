import React from 'react';

const StatusBadge = ({ yes, trueText, falseText }) => (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${yes ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
        {yes ? trueText : falseText}
    </span>
);

export default StatusBadge;

