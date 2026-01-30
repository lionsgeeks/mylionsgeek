import { Image } from 'lucide-react';

const PostMediaPicker = ({ id = 'post-media-picker', onChange, disabled = false, label = 'Add photos', accept = 'image/*', multiple = true }) => (
    <label
        htmlFor={id}
        className={`group flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[var(--color-beta)] transition-all duration-200 hover:scale-105 active:scale-95 dark:text-[var(--color-light)] ${
            disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-[var(--color-light)] dark:hover:bg-[var(--color-dark_gray)]'
        }`}
    >
        <Image size={22} className="transition-transform group-hover:scale-110" />
        <span className="text-sm font-medium">{label}</span>
        <input id={id} type="file" accept={accept} multiple={multiple} onChange={onChange} className="hidden" disabled={disabled} />
    </label>
);

export default PostMediaPicker;
