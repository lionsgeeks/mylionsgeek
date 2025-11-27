import React, { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';

const InfoModalContent = ({ reservationId, initial }) => {
    const [data, setData] = useState({
        team_name: initial?.team_name ?? null,
        team_members: Array.isArray(initial?.team_members) ? initial.team_members : [],
        equipments: Array.isArray(initial?.equipments) ? initial.equipments : [],
    });

    useEffect(() => {
        setData({
            team_name: initial?.team_name ?? null,
            team_members: Array.isArray(initial?.team_members) ? initial.team_members : [],
            equipments: Array.isArray(initial?.equipments) ? initial.equipments : [],
        });
    }, [initial, reservationId]);

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
                                <Avatar
                                    className="w-10 h-10"
                                    image={m?.image?.split('/').pop()}
                                    name={m?.name}
                                    lastActivity={m?.last_online || null}
                                    onlineCircleClass="hidden"
                                    edit={false}
                                />
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

