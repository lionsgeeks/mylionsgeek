import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, History } from 'lucide-react';

export default function NotificationHistory({ announcements = [] }) {
    return (
        <Card className="border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-alpha" />
                    Sent app notifications
                </CardTitle>
                <CardDescription className="text-dark/60 dark:text-light/60">
                    History of app notifications sent to web and mobile users.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {announcements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-dark/60 dark:text-light/60">
                        <Bell className="mb-3 h-10 w-10 opacity-50" />
                        <p className="text-sm">No app notifications sent yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-alpha/20">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-alpha/20 hover:bg-alpha/5">
                                    <TableHead className="text-dark/70 dark:text-light/70">Title</TableHead>
                                    <TableHead className="hidden text-dark/70 md:table-cell dark:text-light/70">Message</TableHead>
                                    <TableHead className="text-right text-dark/70 dark:text-light/70">Sent by</TableHead>
                                    <TableHead className="text-dark/70 dark:text-light/70">Sent at</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.map((item) => (
                                    <TableRow key={item.id} className="border-alpha/15 hover:bg-alpha/5">
                                        <TableCell className="max-w-[180px] font-medium">
                                            <p className="truncate">{item.title}</p>
                                            <p className="mt-1 line-clamp-2 text-xs text-dark/60 md:hidden dark:text-light/60">
                                                {item.message}
                                            </p>
                                        </TableCell>
                                        <TableCell className="hidden max-w-[280px] md:table-cell">
                                            <p className="line-clamp-2 text-sm text-dark/60 dark:text-light/60">{item.message}</p>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">{item.created_by}</TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-dark/60 dark:text-light/60">
                                            {item.created_at}
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
