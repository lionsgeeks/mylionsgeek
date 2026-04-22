import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import RecruiterStudentsPagination from '@/pages/recruiter/students/partials/RecruiterStudentsPagination';
import { Head, Link, router } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function RecruiterStudentsIndex({ students, filters }) {
    const rows = students?.data ?? [];
    const meta = students?.meta;
    const initialQ = filters?.q ?? '';
    const initialField = filters?.field ?? '';

    const [q, setQ] = useState(initialQ);
    const [field, setField] = useState(initialField);

    // Keep state in sync when navigating with pagination/back.
    const syncKey = JSON.stringify({ q: initialQ, field: initialField });
    useEffect(() => {
        const payload = JSON.parse(syncKey);
        setQ(payload.q ?? '');
        setField(payload.field ?? '');
    }, [syncKey]);

    const applyFilters = useCallback((nextQ, nextField) => {
        router.get(
            '/recruiter/students',
            {
                q: nextQ || undefined,
                field: nextField || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }, []);

    const fieldLabel = useMemo(() => {
        if (field === 'coding') return 'Full Stack Developer';
        if (field === 'media') return 'Media / Content Creator';
        return 'All';
    }, [field]);

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
                        Browse students only (excluding status &quot;Studying&quot; and accounts that also have admin, coach, pro, or moderateur
                        roles). Select a card to open their full profile.
                    </p>
                </div>

                <div className="grid gap-4 rounded-lg border border-alpha/15 bg-white p-4 sm:grid-cols-2 dark:border-light/10 dark:bg-dark_gray">
                    <div className="space-y-2">
                        <Label htmlFor="student-search">Search by name</Label>
                        <Input
                            id="student-search"
                            value={q}
                            onChange={(e) => {
                                const next = e.target.value;
                                setQ(next);
                                applyFilters(next, field);
                            }}
                            placeholder="Type a student name…"
                            className="border-alpha/30 dark:border-light/15"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Filter by track</Label>
                        <Select
                            value={field || '__all__'}
                            onValueChange={(v) => {
                                const next = v === '__all__' ? '' : v;
                                setField(next);
                                applyFilters(q, next);
                            }}
                        >
                            <SelectTrigger className="border-alpha/30 dark:border-light/15">
                                <SelectValue placeholder={fieldLabel} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All</SelectItem>
                                <SelectItem value="coding">Full Stack Developer</SelectItem>
                                <SelectItem value="media">Media / Content Creator</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {rows.length === 0 ? (
                    <div className="rounded-lg border border-alpha/15 bg-white p-10 text-center dark:border-light/10 dark:bg-dark_gray">
                        <p className="text-beta dark:text-light">No students match these filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {rows.map((s) => (
                                <Link
                                    key={s.id}
                                    href={`/recruiter/students/${s.id}`}
                                    className="block rounded-xl ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-alpha"
                                >
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
