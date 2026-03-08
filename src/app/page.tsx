"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { LayoutDashboard, CheckSquare, FileText, Component, Timer, Moon, Sun } from "lucide-react";
import AgendaCalendar from "@/components/AgendaCalendar";
import DailyTasks from "@/components/DailyTasks";
import KnowledgeNotes from "@/components/KnowledgeNotes";
import VisualBoard from "@/components/VisualBoard";
import FocusTimer from "@/components/FocusTimer";

type Section = "agenda" | "tasks" | "notes" | "board" | "timer";

export default function Home() {
    const [activeSection, setActiveSection] = useState<Section>("board");
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        // Hydrate theme from localStorage
        const savedTheme = localStorage.getItem("lariflow_theme");
        if (savedTheme === "dark") {
            setTheme("dark");
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("lariflow_theme", newTheme);
    };

    const NavItem = ({ section, icon: Icon, label }: { section: Section, icon: any, label: string }) => (
        <button
            className={`${styles.navItem} ${activeSection === section ? styles.active : ""}`}
            onClick={() => setActiveSection(section)}
        >
            <Icon size={18} className={styles.icon} />
            <span>{label}</span>
        </button>
    );

    return (
        <main className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h1 className={styles.logoText}>YOUPLAN</h1>
                </div>

                <nav className={styles.navigation}>
                    <p className={styles.navLabel}>Spaces</p>
                    <NavItem section="agenda" icon={LayoutDashboard} label="Agenda & Goals" />
                    <NavItem section="tasks" icon={CheckSquare} label="Daily Tasks" />
                    <NavItem section="timer" icon={Timer} label="Focus Timer" />
                    <NavItem section="notes" icon={FileText} label="Knowledge" />
                    <NavItem section="board" icon={Component} label="Visual Board" />
                </nav>

                <div className={styles.sidebarFooter}>
                    <button className={styles.themeToggleBtn} onClick={toggleTheme} aria-label="Toggle Theme">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>

                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>U</div>
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>User</p>
                            <p className={styles.userStatus}>Personal Space</p>
                        </div>
                    </div>
                </div>
            </aside>

            <section className={styles.content}>
                {activeSection === "agenda" && <AgendaCalendar />}
                {activeSection === "tasks" && <DailyTasks />}
                {activeSection === "timer" && <FocusTimer />}
                {activeSection === "notes" && <KnowledgeNotes />}
                {activeSection === "board" && <VisualBoard />}
            </section>
        </main>
    );
}
