"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id?: number;
    title: string;
    start: Date;
    end: Date;
    type: 'Call' | 'Meeting' | 'Email' | 'Other';
    allDay?: boolean;
}

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventType, setNewEventType] = useState<'Call' | 'Meeting' | 'Email' | 'Other'>('Meeting');

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events/');
            const mappedEvents = res.data.map((e: any) => {
                const startDate = new Date(e.start_time);
                return {
                    id: e.id,
                    title: e.title,
                    start: startDate,
                    end: new Date(startDate.getTime() + 60 * 60 * 1000), // Assume 1 hour duration
                    type: e.type,
                    allDay: false
                };
            });
            setEvents(mappedEvents);
        } catch (error) {
            console.error("Failed to fetch events", error);
            toast.error("Failed to load calendar");
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSelectSlot = (slotInfo: SlotInfo) => {
        setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
        setOpen(true);
    };

    const handleSaveEvent = async () => {
        if (!newEventTitle || !selectedSlot) return;

        setLoading(true);
        try {
            const payload = {
                title: newEventTitle,
                start_time: selectedSlot.start.toISOString(),
                type: newEventType
            };

            await api.post('/events/', payload);
            toast.success("Event created");
            setOpen(false);
            setNewEventTitle('');
            await fetchEvents();
        } catch (error) {
            console.error("Failed to create event", error);
            toast.error("Failed to save event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 h-full">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Schedule & Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[600px]">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            views={['month', 'week', 'day', 'agenda']}
                            defaultView="week"
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Event</DialogTitle>
                        <DialogDescription>
                            Create a new event in your calendar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                className="col-span-3"
                                placeholder="Meeting with Client"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select
                                value={newEventType}
                                onValueChange={(val: any) => setNewEventType(val)}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Call">Call</SelectItem>
                                    <SelectItem value="Meeting">Meeting</SelectItem>
                                    <SelectItem value="Email">Email</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Time</Label>
                            <div className="col-span-3 text-sm text-muted-foreground">
                                {selectedSlot && format(selectedSlot.start, 'PPpp')}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSaveEvent} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Event
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
