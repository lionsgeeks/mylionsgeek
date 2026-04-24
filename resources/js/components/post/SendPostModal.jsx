import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

function buildPostShareLink(post) {
    const interactionPostId = post?.interaction_post_id ?? post?.repost_of_post_id ?? post?.id;
    return interactionPostId ? `/students/feed#post-${interactionPostId}` : '/students/feed';
}

export default function SendPostModal({ open, onOpenChange, post, defaultMessage = '' }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [query, setQuery] = useState('');
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState(defaultMessage);

    const shareLink = useMemo(() => buildPostShareLink(post), [post]);

    useEffect(() => {
        if (!open) {
            setLoading(false);
            setError(null);
            setConversations([]);
            setQuery('');
            setSelectedConversationId(null);
            setSending(false);
            setMessage(defaultMessage);
            return;
        }

        const fetchConversations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/chat', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to load conversations');
                }

                const data = await response.json();
                setConversations(Array.isArray(data?.conversations) ? data.conversations : []);
            } catch (err) {
                setError(err?.message || 'Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [open, defaultMessage]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return conversations;
        return conversations.filter((c) => (c?.other_user?.name || '').toLowerCase().includes(q) || (c?.other_user?.email || '').toLowerCase().includes(q));
    }, [conversations, query]);

    const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const handleSend = async () => {
        if (!selectedConversationId || sending) return;
        setSending(true);
        setError(null);

        const body = `${(message || '').trim()}\n\n${shareLink}`.trim();

        try {
            const response = await fetch(`/chat/conversation/${selectedConversationId}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ body }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data?.error || data?.message || 'Failed to send post');
            }

            onOpenChange(false);
        } catch (err) {
            setError(err?.message || 'Failed to send post');
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-beta dark:text-light">Send post</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations..." />

                    <div className="max-h-64 overflow-auto rounded-lg border border-border/70 dark:border-white/10">
                        {loading ? (
                            <div className="p-4 text-sm text-muted-foreground">Loading conversations...</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground">No conversations found.</div>
                        ) : (
                            <div className="divide-y divide-border/60 dark:divide-white/10">
                                {filtered.map((c) => {
                                    const selected = Number(selectedConversationId) === Number(c.id);
                                    const other = c.other_user;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setSelectedConversationId(c.id)}
                                            className={cn(
                                                'flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/40 dark:hover:bg-white/5',
                                                selected && 'bg-muted/50 dark:bg-white/10',
                                            )}
                                        >
                                            <Avatar className="h-9 w-9" image={other?.image} name={other?.name} />
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-semibold text-beta dark:text-light">{other?.name}</div>
                                                <div className="truncate text-xs text-muted-foreground">{other?.email}</div>
                                            </div>
                                            {c.unread_count > 0 && (
                                                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                                                    {c.unread_count > 99 ? '99+' : c.unread_count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Message (optional)</div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-20 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground dark:border-white/10"
                            placeholder="Add a message..."
                            maxLength={1000}
                        />
                        <div className="text-xs text-muted-foreground">
                            Link to post will be appended: <span className="font-mono">{shareLink}</span>
                        </div>
                    </div>

                    {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

                    <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={sending}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSend} disabled={!selectedConversationId || sending}>
                            {sending ? 'Sending...' : 'Send'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

