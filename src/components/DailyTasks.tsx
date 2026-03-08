"use client";

import { useState } from "react";
import { useStore, Task } from "@/lib/Store";
import { Plus, Check, Trash2, Circle } from "lucide-react";
import styles from "./DailyTasks.module.css";

const priorityColors = {
    high: "var(--accent-red)",
    medium: "var(--accent-orange)",
    low: "var(--accent-blue)",
};

export default function DailyTasks() {
    const { state, setState } = useStore();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: newTaskTitle.trim(),
            priority: newTaskPriority,
            completed: false,
        };

        setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
        setNewTaskTitle("");
    };

    const toggleTask = (id: string) => {
        setState(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
        }));
    };

    const removeTask = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setState(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== id)
        }));
    };

    // Sort: uncompleted first, then high -> medium -> low
    const sortedTasks = [...state.tasks].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        const pWeight = { high: 3, medium: 2, low: 1 };
        return pWeight[b.priority] - pWeight[a.priority];
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h2 className={styles.title}>Today</h2>
                    <p className={styles.subtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <div className={styles.content}>
                <form className={styles.addForm} onSubmit={addTask}>
                    <div className={styles.inputWrapper}>
                        <button type="submit" className={styles.addBtn} aria-label="Add task">
                            <Plus size={18} className={styles.plusIcon} />
                        </button>
                        <input
                            type="text"
                            placeholder="Add a new task..."
                            className={styles.input}
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                    </div>

                    <div className={styles.prioritySelector}>
                        {(["low", "medium", "high"] as const).map(p => (
                            <button
                                key={p}
                                type="button"
                                className={`${styles.priorityBtn} ${newTaskPriority === p ? styles.activeParams : ""}`}
                                style={{ '--p-color': priorityColors[p] } as React.CSSProperties}
                                onClick={() => setNewTaskPriority(p)}
                            >
                                <div className={styles.priorityDot} />
                                <span className={styles.priorityLabel}>{p}</span>
                            </button>
                        ))}
                    </div>
                </form>

                <div className={styles.taskList}>
                    {sortedTasks.length === 0 && (
                        <div className={styles.emptyState}>
                            <Circle size={48} className={styles.emptyIcon} strokeWidth={1} />
                            <p>Your day is clear.</p>
                        </div>
                    )}

                    {sortedTasks.map(task => (
                        <div
                            key={task.id}
                            className={`${styles.taskItem} ${task.completed ? styles.completed : ""}`}
                            onClick={() => toggleTask(task.id)}
                        >
                            <div className={styles.checkbox}>
                                {task.completed && <Check size={14} className={styles.checkIcon} />}
                            </div>

                            <div className={styles.taskContent}>
                                <span className={styles.taskTitle}>{task.title}</span>
                                <span
                                    className={`${styles.taskPriority} ${styles[task.priority]}`}
                                    style={{ color: priorityColors[task.priority] }}
                                >
                                    {task.priority}
                                </span>
                            </div>

                            <button
                                className={styles.deleteBtn}
                                onClick={(e) => removeTask(task.id, e)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
