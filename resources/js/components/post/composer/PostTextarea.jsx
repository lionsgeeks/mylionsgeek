import React from 'react';

const PostTextarea = ({ value, onChange, placeholder, disabled = false }) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-h-[120px] resize-none text-lg outline-none bg-transparent text-[var(--color-beta)] dark:text-[var(--color-light)] placeholder-[var(--color-dark_gray)] dark:placeholder-[var(--color-light)]/50 p-4 rounded-xl hover:bg-[var(--color-light)]/40 dark:hover:bg-[var(--color-dark_gray)]/40 focus:bg-[var(--color-light)] dark:focus:bg-[var(--color-dark_gray)] transition-all duration-200 whitespace-pre-wrap disabled:opacity-60"
        rows={4}
    />
);

export default PostTextarea;

