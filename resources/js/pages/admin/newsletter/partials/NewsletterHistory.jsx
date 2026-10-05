import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Mail } from 'lucide-react';

function stripHtml(html = '') {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export default function NewsletterHistory({ history = [] }) {
    return (
        <Card className="border-alpha/20 bg-light text-dark dark:bg-dark dark:text-light">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5 text-alpha" />
                    Send history
                </CardTitle>
                <CardDescription className="text-dark/60 dark:text-light/60">
                    Previous newsletters sent from this page, including who sent them.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-alpha/25 py-12 text-center text-dark/60 dark:text-light/60">
                        <Mail className="mb-3 h-10 w-10 opacity-50" />
                        <p className="text-sm font-medium">No newsletters sent yet</p>
                        <p className="mt-1 text-xs">Your send history will appear here after the first email.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-alpha/20">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-alpha/20 hover:bg-alpha/5">
                                    <TableHead className="text-dark/70 dark:text-light/70">Subject</TableHead>
                                    <TableHead className="hidden text-dark/70 md:table-cell dark:text-light/70">
                                        Preview
                                    </TableHead>
                                    <TableHead className="text-dark/70 dark:text-light/70">Recipients</TableHead>
                                    <TableHead className="text-dark/70 dark:text-light/70">Sent by</TableHead>
                                    <TableHead className="text-dark/70 dark:text-light/70">Sent at</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((item) => {
                                    const preview = stripHtml(item.preview);

                                    return (
                                        <TableRow key={item.id} className="border-alpha/15 hover:bg-alpha/5">
                                            <TableCell className="max-w-[200px] font-medium">
                                                <p className="truncate">{item.subject}</p>
                                                <p className="mt-1 line-clamp-2 text-xs text-dark/60 md:hidden dark:text-light/60">
                                                    {preview}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden max-w-[280px] md:table-cell">
                                                <p className="line-clamp-2 text-sm text-dark/60 dark:text-light/60">
                                                    {preview || '—'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm">
                                                <span className="inline-flex rounded-full bg-alpha/15 px-2.5 py-0.5 text-xs font-semibold text-beta dark:text-alpha">
                                                    {item.recipients_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-sm">{item.sent_by}</TableCell>
                                            <TableCell className="whitespace-nowrap text-sm text-dark/60 dark:text-light/60">
                                                {item.sent_at}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
