"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, Phone, Users, Mail, Clock } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    start_time: string;
    type: 'Call' | 'Meeting' | 'Email' | 'Other';
}

interface ScheduleWidgetProps {
    events?: Event[];
    className?: string;
}

export function ScheduleWidget({ events = [], className }: ScheduleWidgetProps) {

    const getIcon = (type: string) => {
        switch (type) {
            case 'Call': return <Phone className="h-4 w-4 text-blue-500" />;
            case 'Meeting': return <Users className="h-4 w-4 text-green-500" />;
            case 'Email': return <Mail className="h-4 w-4 text-orange-500" />;
            default: return <Calendar className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Today's Schedule
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-2">
                {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No events scheduled today.</p>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <div key={event.id} className="flex items-start">
                                <div className="mt-0.5 mr-3 p-1.5 bg-slate-100 rounded-full">
                                    {getIcon(event.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatTime(event.start_time)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
