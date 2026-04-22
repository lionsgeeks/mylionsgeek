import React from 'react';
import { Link } from '@inertiajs/react';

const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const MENTION_REGEX = /(@[A-Za-z0-9_]+)/g;

const splitUrlTrailingPunctuation = (rawUrl) => {
    if (!rawUrl) {
        return { url: rawUrl, trailing: '' };
    }

    const match = String(rawUrl).match(/^(.*?)([),.;:!?]+)?$/);
    if (!match) {
        return { url: rawUrl, trailing: '' };
    }

    return { url: match[1] ?? rawUrl, trailing: match[2] ?? '' };
};

const normalizeHref = (rawUrl) => {
    if (!rawUrl) {
        return null;
    }

    const value = String(rawUrl).trim();
    if (!value) {
        return null;
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    if (/^www\./i.test(value)) {
        return `https://${value}`;
    }

    return null;
};

const renderTextWithLinks = (text, keyPrefix = 'text') => {
    if (!text) {
        return null;
    }

    const parts = String(text).split(URL_REGEX);

    return parts.map((part, index) => {
        if (!part) {
            return null;
        }

        if (URL_REGEX.test(part)) {
            const { url, trailing } = splitUrlTrailingPunctuation(part);
            const href = normalizeHref(url);

            if (!href) {
                return <span key={`${keyPrefix}-${index}`}>{part}</span>;
            }

            return (
                <React.Fragment key={`${keyPrefix}-${index}`}>
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {url}
                    </a>
                    {trailing ? <span>{trailing}</span> : null}
                </React.Fragment>
            );
        }

        return <span key={`${keyPrefix}-${index}`}>{part}</span>;
    });
};

export const renderPostText = ({ text, post }) => {
    if (!text) {
        return null;
    }

    const mentionUserIds = post?.mention_user_ids ?? {};
    const parts = String(text).split(MENTION_REGEX);

    return parts.map((part, index) => {
        if (!part) {
            return null;
        }

        if (part.startsWith('@') && part.length > 1) {
            const tokenKey = part.slice(1).toLowerCase();
            const resolvedId = mentionUserIds[tokenKey];

            if (resolvedId != null) {
                return (
                    <Link key={`${part}-${index}`} href={`/students/${resolvedId}`} className="text-alpha hover:underline">
                        {part}
                    </Link>
                );
            }

            return (
                <span key={`${part}-${index}`} className="text-alpha">
                    {part}
                </span>
            );
        }

        return <React.Fragment key={`plain-${index}`}>{renderTextWithLinks(part, `url-${index}`)}</React.Fragment>;
    });
};

