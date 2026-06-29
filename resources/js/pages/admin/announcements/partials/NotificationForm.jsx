import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Bell, Send } from 'lucide-react';

const fieldClass =
    'border border-alpha/30 bg-light text-dark placeholder:text-dark/50 focus:border-alpha focus:ring-2 focus:ring-alpha dark:bg-dark dark:text-light dark:placeholder:text-light/50';

export default function NotificationForm() {
    const { data, setData, post, errors, processing, reset } = useForm({
        title: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/admin/announcements/store', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <Card className="border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-alpha" />
                    Compose announcement
                </CardTitle>
                <CardDescription className="text-dark/60 dark:text-light/60">
                    Users will see this in their notification bell when they open or refresh notifications.
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
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. New event this Friday"
                            maxLength={100}
                        />
                        <div className="mt-1 flex justify-between text-xs text-dark/60 dark:text-light/60">
                            <span>{errors.title && <span className="text-error">{errors.title}</span>}</span>
                            <span>{data.title.length}/100</span>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="notification-body" className="text-dark dark:text-light">
                            Message
                        </Label>
                        <Textarea
                            id="notification-body"
                            className={`min-h-[140px] resize-y ${fieldClass}`}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Write the announcement message..."
                            maxLength={500}
                        />
                        <div className="mt-1 flex justify-between text-xs text-dark/60 dark:text-light/60">
                            <span>{errors.message && <span className="text-error">{errors.message}</span>}</span>
                            <span>{data.message.length}/500</span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full cursor-pointer gap-2 border border-alpha bg-alpha text-beta hover:bg-dark_gray hover:text-alpha dark:text-dark dark:hover:bg-alpha/80 dark:hover:text-dark"
                    >
                        {processing ? (
                            'Sending…'
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send announcement
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
