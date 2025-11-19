import React, { useState, useEffect } from 'react';

const InfoModalContent = ({ reservationId, initial }) => {
    const [data, setData] = useState({ 
        loading: true, 
        team_name: initial.team_name, 
        team_members: initial.team_members, 
        equipments: initial.equipments 
    });

    useEffect(() => {
        let aborted = false;
        async function load() {
            try {
                const res = await fetch(`/admin/reservations/${reservationId}/info`, { 
                    headers: { 'Accept': 'application/json' }, 
                    credentials: 'same-origin' 
                });
                const body = await res.json();
                if (!aborted) {
                    setData({ 
                        loading: false, 
                        team_name: body.team_name ?? null, 
                        team_members: Array.isArray(body.team_members) ? body.team_members : [], 
                        equipments: Array.isArray(body.equipments) ? body.equipments : [] 
                    });
                }
            } catch (e) {
                if (!aborted) setData((d) => ({ ...d, loading: false }));
            }
        }
        load();
        return () => { aborted = true; };
    }, [reservationId]);

    if (data.loading) {
        return <div className="text-sm text-muted-foreground">Loading…</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <div className="text-muted-foreground mb-2">Equipments</div>
                {data.equipments.length ? (
                    <div className="grid grid-cols-1 gap-3">
                        {data.equipments.map((e, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                {e?.image ? (
                                    <img src={e.image} alt={e.reference || e.mark || 'equipment'} className="h-10 w-10 rounded object-cover" />
                                ) : (
                                    <div className="h-10 w-10 rounded bg-muted" />
                                )}
                                <div className="text-sm">
                                    <div className="font-medium break-words">{e?.reference || '—'}</div>
                                    <div className="text-muted-foreground break-words">{e?.mark || '—'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">No equipments.</div>
                )}
            </div>
            <div>
                <div className="text-muted-foreground mb-2">Team {data.team_name ? `— ${data.team_name}` : ''}</div>
                {data.team_members.length ? (
                    <div className="grid grid-cols-1 gap-3">
                        {data.team_members.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                {m?.image ? (
                                    <img src={m.image} alt={m.name || 'member'} className="h-9 w-9 rounded-full object-cover" />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-muted" />
                                )}
                                <div className="text-sm font-medium break-words">{m?.name || '—'}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">No team members.</div>
                )}
            </div>
        </div>
    );
};

export default InfoModalContent;

