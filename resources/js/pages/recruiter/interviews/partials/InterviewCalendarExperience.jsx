import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useCallback, useMemo, useRef, useState } from 'react';

/** FullCalendar needs an end; events are shown as 30 minutes from start. */
function isoAddMinutes(iso, minutes) {
    if (!iso) return iso;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    d.setMinutes(d.getMinutes() + minutes);
    return d.toISOString();
}

function formatAgendaTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function startOfLocalDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function renderEventContent(eventInfo) {
    const row = eventInfo.event.extendedProps?.interviewRow;
    const applicant = row?.application?.applicant_name;
    const job = row?.application?.job_title;
    const sub = applicant ? `${applicant}${job ? ` · ${job}` : ''}` : row?.location || row?.group_label || '';

    return (
        <div className="fc-event-main-frame flex flex-col gap-0.5 px-0.5 py-0.5 text-left leading-tight">
            {eventInfo.timeText ? (
                <span className="text-[0.65rem] font-semibold text-beta/80 dark:text-light/80">{eventInfo.timeText}</span>
            ) : null}
            {row?.group_label ? (
                <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-alpha dark:text-alpha">{row.group_label}</span>
            ) : null}
            <span className="text-xs font-semibold text-beta dark:text-light">{row?.title ?? eventInfo.event.title}</span>
            {sub ? <span className="line-clamp-2 text-[0.65rem] opacity-90">{sub}</span> : null}
        </div>
    );
}

export default function InterviewCalendarExperience({ interviews = [], onRequestCreate, onEditInterview }) {
    const calendarRef = useRef(null);
    const [query, setQuery] = useState('');

    const events = useMemo(
        () =>
            (interviews ?? []).map((row) => ({
                id: String(row.id),
                title: row.title,
                start: row.starts_at,
                end: isoAddMinutes(row.starts_at, 30),
                extendedProps: { interviewRow: row },
                classNames: row.job_application_id ? ['recruiter-fc-event', 'recruiter-fc-event--linked'] : ['recruiter-fc-event'],
            })),
        [interviews],
    );

    const now = useMemo(() => new Date(), []);

    const { upcomingSorted, thisWeekCount, totalUpcoming } = useMemo(() => {
        const startToday = startOfLocalDay(now);
        const weekEnd = new Date(startToday);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const upcoming = (interviews ?? [])
            .filter((row) => {
                const t = new Date(row.starts_at);
                return !Number.isNaN(t.getTime()) && t >= startToday;
            })
            .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));

        const q = query.trim().toLowerCase();
        const filtered = q
            ? upcoming.filter((row) => {
                  const blob = [
                      row.title,
                      row.group_label,
                      row.location,
                      row.application?.applicant_name,
                      row.application?.job_title,
                  ]
                      .filter(Boolean)
                      .join(' ')
                      .toLowerCase();
                  return blob.includes(q);
              })
            : upcoming;

        const thisWeek = upcoming.filter((row) => {
            const t = new Date(row.starts_at);
            return t >= startToday && t < weekEnd;
        }).length;

        return { upcomingSorted: filtered, thisWeekCount: thisWeek, totalUpcoming: upcoming.length };
    }, [interviews, now, query]);

    const focusInterviewOnCalendar = useCallback((row) => {
        const api = calendarRef.current?.getApi?.();
        if (!api || !row?.starts_at) return;
        const d = new Date(row.starts_at);
        if (!Number.isNaN(d.getTime())) {
            api.gotoDate(d);
            api.changeView('timeGridDay', d);
        }
    }, []);

    const selectAllow = useCallback((span) => {
        const start = span?.start;
        if (!start) return false;
        return start.getTime() >= Date.now() - 60 * 1000;
    }, []);

    const changeView = useCallback((view) => {
        calendarRef.current?.getApi?.().changeView(view);
    }, []);

    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
            <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    {/* <p className="text-sm text-beta/80 dark:text-light/80">
                        <span className="font-medium text-beta dark:text-light">Tip:</span> drag across the grid to pick a start time, or click a slot.
                        Click an interview to edit.
                    </p> */}
                    <div className="flex flex-wrap gap-2 md:hidden">
                        <Button type="button" size="sm" variant="outline" className="border-alpha/30 dark:border-light/15" onClick={() => changeView('timeGridDay')}>
                            Day
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="border-alpha/30 dark:border-light/15" onClick={() => changeView('timeGridWeek')}>
                            Week
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="border-alpha/30 dark:border-light/15" onClick={() => changeView('dayGridMonth')}>
                            Month
                        </Button>
                    </div>
                </div>

                <Card className="gap-0 border-alpha/15 py-0 dark:border-light/10 dark:bg-dark_gray">
                    <CardContent className="recruiter-fc-shell p-0 sm:p-1">
                        <div className="min-h-[520px] sm:min-h-[600px]">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
                                height="auto"
                                firstDay={1}
                                nowIndicator
                                slotDuration="00:30:00"
                                slotMinTime="07:00:00"
                                slotMaxTime="20:00:00"
                                scrollTime="08:30:00"
                                stickyHeaderDates
                                allDaySlot={false}
                                editable={false}
                                selectable
                                selectMirror
                                selectMinDistance={6}
                                selectAllow={selectAllow}
                                dayMaxEvents
                                eventDisplay="block"
                                events={events}
                                eventContent={renderEventContent}
                                dateClick={(info) => onRequestCreate(info.date)}
                                select={(info) => {
                                    if (info.view.type === 'dayGridMonth') {
                                        info.view.calendar.unselect();
                                        return;
                                    }
                                    onRequestCreate(info.start);
                                    info.view.calendar.unselect();
                                }}
                                eventClick={(info) => {
                                    const row = info.event.extendedProps?.interviewRow;
                                    if (row?.id) onEditInterview(row);
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <aside className="w-full shrink-0 space-y-4 lg:w-80 lg:sticky lg:top-20 lg:self-start">
                <Card className="border-alpha/15 py-4 dark:border-light/10 dark:bg-dark_gray">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-beta dark:text-light">Agenda</CardTitle>
                        <CardDescription>
                            {totalUpcoming} upcoming · {thisWeekCount} in the next 7 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 px-6 pt-0">
                        <Input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search title, group, applicant…"
                            className="border-alpha/30 dark:border-light/15"
                            aria-label="Filter upcoming interviews"
                        />
                        {upcomingSorted.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {query.trim() ? 'No matches in upcoming interviews.' : 'No upcoming interviews. Pick a time on the calendar to create one.'}
                            </p>
                        ) : (
                            <ul className="custom-scrollbar max-h-[min(420px,50vh)] space-y-2 overflow-y-auto pr-1">
                                {upcomingSorted.map((row) => (
                                    <li key={row.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                focusInterviewOnCalendar(row);
                                                onEditInterview(row);
                                            }}
                                            className="w-full rounded-lg border border-alpha/15 bg-light/80 p-3 text-left transition hover:border-alpha/40 hover:bg-light dark:border-light/10 dark:bg-dark/40 dark:hover:border-alpha/50 dark:hover:bg-dark/80"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-medium text-beta dark:text-light">{formatAgendaTime(row.starts_at)}</span>
                                                {row.job_application_id ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="border-alpha/20 bg-alpha/15 text-xs text-beta dark:border-alpha/30 dark:bg-alpha/20 dark:text-light"
                                                    >
                                                        Linked app
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-sm font-semibold text-beta dark:text-light">{row.title}</p>
                                            {row.group_label ? (
                                                <p className="mt-0.5 text-xs text-alpha dark:text-alpha">{row.group_label}</p>
                                            ) : null}
                                            {row.application?.applicant_name ? (
                                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                                    {row.application.applicant_name}
                                                    {row.application.job_title ? ` · ${row.application.job_title}` : ''}
                                                </p>
                                            ) : row.location ? (
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.location}</p>
                                            ) : null}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </aside>
        </div>
    );
}
