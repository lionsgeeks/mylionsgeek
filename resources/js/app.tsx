import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import ToastNotificationManager from './components/chat/ToastNotificationManager';
import axios from 'axios';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Configure Axios globally: CSRF + cookies
const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
if (csrfMeta?.content) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfMeta.content;
}
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Function to refresh CSRF token from meta tag
const refreshCsrfToken = () => {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    if (meta?.content) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = meta.content;
        return meta.content;
    }
    return null;
};

// Axios interceptor to handle 419 errors (CSRF token expired)
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 419) {
            // CSRF token expired - reload the page to get a fresh CSRF token
            console.warn('CSRF token expired. Reloading page...');
            window.location.reload();
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

// Provide a safe global queryParams helper for places that expect it
declare global {
    interface Window { queryParams?: () => URLSearchParams }
}
if (typeof window !== 'undefined' && !window.queryParams) {
    window.queryParams = () => new URLSearchParams(window.location.search);
}

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.jsx`, import.meta.glob('./pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ToastNotificationManager />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
