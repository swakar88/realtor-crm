"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Trash2, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

export function TodoWidget({ className }: { className?: string }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks/');
            setTasks(res.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        setAdding(true);
        try {
            const res = await api.post('/tasks/', { title: newTask });
            setTasks([res.data, ...tasks]);
            setNewTask('');
            toast.success("Task added");
        } catch (error) {
            toast.error("Failed to add task");
        } finally {
            setAdding(false);
        }
    };

    const toggleTask = async (task: Task) => {
        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
        );
        setTasks(updatedTasks);

        try {
            await api.patch(`/tasks/${task.id}/`, { is_completed: !task.is_completed });
        } catch (error) {
            // Revert on failure
            setTasks(tasks);
            toast.error("Failed to update task");
        }
    };

    const deleteTask = async (id: number) => {
        const originalTasks = [...tasks];
        setTasks(tasks.filter(t => t.id !== id));

        try {
            await api.delete(`/tasks/${id}/`);
            toast.success("Task deleted");
        } catch (error) {
            setTasks(originalTasks);
            toast.error("Failed to delete task");
        }
    };

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    My Tasks
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
                <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                    <Input
                        placeholder="Add a task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="h-8"
                    />
                    <Button type="submit" size="sm" className="h-8 px-2" disabled={adding}>
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No tasks yet.</p>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className="flex items-center group">
                                <Checkbox
                                    checked={task.is_completed}
                                    onCheckedChange={() => toggleTask(task)}
                                    id={`task-${task.id}`}
                                />
                                <label
                                    htmlFor={`task-${task.id}`}
                                    className={`flex-1 ml-2 text-sm cursor-pointer ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}
                                >
                                    {task.title}
                                </label>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
