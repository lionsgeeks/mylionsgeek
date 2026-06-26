import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send } from 'lucide-react';
import { useState } from 'react';

const fieldClass =
    'border border-alpha/30 bg-light text-dark placeholder:text-dark/50 focus:border-alpha focus:ring-2 focus:ring-alpha dark:bg-dark dark:text-light dark:placeholder:text-light/50';

export default function NotificationForm({ onSend }) {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [errors, setErrors] = useState({});
    const [sending, setSending] = useState(false);

    const validate = () => {
        const next = {};
        if (!title.trim()) next.title = 'Title is required.';
        if (!body.trim()) next.body = 'Message body is required.';
        if (title.trim().length > 100) next.title = 'Title must be 100 characters or less.';
        if (body.trim().length > 500) next.body = 'Message must be 500 characters or less.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSending(true);

        window.setTimeout(() => {
            onSend({ title: title.trim(), body: body.trim() });
            setTitle('');
            setBody('');
            setSending(false);
        }, 600);
    };

    return (
        <Card className="border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-alpha" />
                    Compose notification
                </CardTitle>
                <CardDescription className="text-dark/60 dark:text-light/60">
                    Users will receive this as a push notification on the mobile app.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="notification-title" className="text-dark dark:text-light">
                            Title
                        </Label>
                        <Input
                            id="notification-title"
                            className={fieldClass}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. New event this Friday"
                            maxLength={100}
                        />
                        <div className="mt-1 flex justify-between text-xs text-dark/60 dark:text-light/60">
                            <span>{errors.title && <span className="text-error">{errors.title}</span>}</span>
                            <span>{title.length}/100</span>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="notification-body" className="text-dark dark:text-light">
                            Message
                        </Label>
                        <Textarea
                            id="notification-body"
                            className={`min-h-[140px] resize-y ${fieldClass}`}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write the notification message..."
                            maxLength={500}
                        />
                        <div className="mt-1 flex justify-between text-xs text-dark/60 dark:text-light/60">
                            <span>{errors.body && <span className="text-error">{errors.body}</span>}</span>
                            <span>{body.length}/500</span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={sending}
                        className="w-full gap-2 border border-alpha bg-alpha text-beta hover:bg-dark_gray hover:text-alpha dark:text-dark dark:hover:bg-alpha/80 dark:hover:text-dark cursor-pointer"
                    >
                        {sending ? (
                            'Sending…'
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send notification
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
