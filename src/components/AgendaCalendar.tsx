"use client";

import { useState } from "react";
import { useStore, Goal } from "@/lib/Store";
import { ChevronLeft, ChevronRight, Plus, Check, Trash2 } from "lucide-react";
import styles from "./AgendaCalendar.module.css";

const COLORS = ["#0071e3", "#ff3b30", "#ff9500", "#34c759", "#af52de"];

export default function AgendaCalendar() {
    const { state, setState } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Quick hack to get days in current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const addGoal = (dateStr: string) => {
        const title = prompt("Enter your goal/event:");
        if (!title) return;

        // Pick random color or let user choose later (for simplicity, random from our list)
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        const newGoal: Goal = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            color,
            completed: false,
            date: dateStr
        };

        setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
    };

    const toggleGoal = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setState(prev => ({
            ...prev,
            goals: prev.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
        }));
    };

    const removeGoal = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setState(prev => ({
            ...prev,
            goals: prev.goals.filter(g => g.id !== id)
        }));
    };

    const getGoalsForDate = (dateStr: string) => {
        return state.goals.filter(g => g.date === dateStr);
    };

    const renderDays = () => {
        const blanks = Array(firstDayOfMonth).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const allCells = [...blanks, ...days];

        return allCells.map((day, ix) => {
            if (!day) return <div key={`blank-${ix}`} className={styles.dayCellEmpty} />;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayGoals = getGoalsForDate(dateStr);

            return (
                <div key={dateStr} className={styles.dayCell} onClick={() => addGoal(dateStr)}>
                    <div className={styles.dayHeader}>
                        <span className={styles.dayNumber}>{day}</span>
                        <button className={styles.addButton}><Plus size={14} /></button>
                    </div>
                    <div className={styles.goalsList}>
                        {dayGoals.map(goal => (
                            <div
                                key={goal.id}
                                className={`${styles.goalItem} ${goal.completed ? styles.completed : ""}`}
                                style={{ '--goal-color': goal.color } as React.CSSProperties}
                                onClick={(e) => toggleGoal(goal.id, e)}
                            >
                                <div className={styles.goalCheckbox}>
                                    {goal.completed && <Check size={10} />}
                                </div>
                                <span className={styles.goalTitle}>{goal.title}</span>
                                <button
                                    className={styles.deleteGoalBtn}
                                    onClick={(e) => removeGoal(goal.id, e)}
                                    aria-label="Delete goal"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.monthSelector}>
                    <button onClick={prevMonth} className={styles.iconBtn}><ChevronLeft size={20} /></button>
                    <h2 className={styles.monthTitle}>{monthName} {year}</h2>
                    <button onClick={nextMonth} className={styles.iconBtn}><ChevronRight size={20} /></button>
                </div>
            </header>

            <div className={styles.calendarGrid}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={styles.weekdayHeading}>{day}</div>
                ))}
                {renderDays()}
            </div>
        </div>
    );
}
