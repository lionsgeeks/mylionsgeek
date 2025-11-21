import React from 'react';
import { Image } from 'lucide-react';

const PostMediaPicker = ({
    id = 'post-media-picker',
    onChange,
    disabled = false,
    label = 'Add photos',
    accept = 'image/*',
    multiple = true,
}) => (
    <label
        htmlFor={id}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-[var(--color-beta)] dark:text-[var(--color-light)] transition-all duration-200 hover:scale-105 active:scale-95 group ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--color-light)] dark:hover:bg-[var(--color-dark_gray)]'
            }`}
    >
        <Image size={22} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">{label}</span>
        <input
            id={id}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={onChange}
            className="hidden"
            disabled={disabled}
        />
    </label>
);

export default PostMediaPicker;

