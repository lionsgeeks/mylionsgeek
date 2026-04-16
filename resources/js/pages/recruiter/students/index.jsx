import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import RecruiterStudentsPagination from '@/pages/recruiter/students/partials/RecruiterStudentsPagination';
import { Head, Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

export default function RecruiterStudentsIndex({ students }) {
    const rows = students?.data ?? [];
    const meta = students?.meta;

    return (
        <AppLayout>
            <Head title="Students" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-beta dark:text-light">
                        <GraduationCap className="h-7 w-7 text-alpha" aria-hidden />
                        Students
                    </h1>
                    <p className="mt-1 text-sm text-beta/70 dark:text-light/70">
                        Browse students only (excluding status &quot;Studying&quot; and accounts that also have admin, coach, pro, or
                        moderateur roles). Select a card to open their full profile.
                    </p>
                </div>

                {rows.length === 0 ? (
                    <div className="rounded-lg border border-alpha/15 bg-white p-10 text-center dark:border-light/10 dark:bg-dark_gray">
                        <p className="text-beta dark:text-light">No students match these filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {rows.map((s) => (
                                <Link key={s.id} href={`/recruiter/students/${s.id}`} className="block rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-alpha">
                                    <Card className="h-full border-alpha/15 transition-shadow hover:shadow-md dark:border-light/10 dark:bg-dark_gray">
                                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                            <Avatar name={s.name} image={s.image || undefined} className="h-14 w-14 shrink-0" />
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <CardTitle className="line-clamp-1 text-lg text-beta dark:text-light">{s.name}</CardTitle>
                                                <CardDescription className="line-clamp-1">{s.email}</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex flex-wrap gap-2 pt-0">
                                            {s.status ? (
                                                <Badge variant="secondary" className="capitalize">
                                                    {s.status}
                                                </Badge>
                                            ) : null}
                                            {s.field ? (
                                                <Badge variant="outline" className="capitalize">
                                                    {s.field}
                                                </Badge>
                                            ) : null}
                                            {s.formation ? (
                                                <Badge variant="outline" className="max-w-full truncate font-normal">
                                                    {s.formation}
                                                </Badge>
                                            ) : null}
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        <RecruiterStudentsPagination meta={meta} />
                    </>
                )}
            </div>
        </AppLayout>
    );
}
