import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Smartphone } from 'lucide-react';

function formatSentAt(iso) {
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export default function NotificationHistory({ notifications = [] }) {
    return (
        <Card className="border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-alpha" />
                    Sent notifications
                </CardTitle>
                <CardDescription className="text-dark/60 dark:text-light/60">
                    History of push notifications sent to mobile users.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-dark/60 dark:text-light/60">
                        <Smartphone className="mb-3 h-10 w-10 opacity-50" />
                        <p className="text-sm">No notifications sent yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-alpha/20">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-alpha/20 hover:bg-alpha/5">
                                    <TableHead className="text-dark/70 dark:text-light/70">Title</TableHead>
                                    <TableHead className="hidden text-dark/70 md:table-cell dark:text-light/70">Message</TableHead>
                                    <TableHead className="text-dark/70 dark:text-light/70">Sent at</TableHead>
                                    <TableHead className="text-right text-dark/70 dark:text-light/70">Recipients</TableHead>
                                    <TableHead className="text-right text-dark/70 dark:text-light/70">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.map((item) => (
                                    <TableRow key={item.id} className="border-alpha/15 hover:bg-alpha/5">
                                        <TableCell className="max-w-[180px] font-medium">
                                            <p className="truncate">{item.title}</p>
                                            <p className="mt-1 line-clamp-2 text-xs text-dark/60 md:hidden dark:text-light/60">
                                                {item.body}
                                            </p>
                                        </TableCell>
                                        <TableCell className="hidden max-w-[280px] md:table-cell">
                                            <p className="line-clamp-2 text-sm text-dark/60 dark:text-light/60">{item.body}</p>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-dark/60 dark:text-light/60">
                                            {formatSentAt(item.sentAt)}
                                        </TableCell>
                                        <TableCell className="text-right text-sm">{item.recipientCount}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge className="border border-good/30 bg-good/10 text-good">{item.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
