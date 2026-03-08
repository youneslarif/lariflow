"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, CloudRain, Flame, Trees, Waves, Wind } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import styles from "./FocusTimer.module.css";

const natureSounds = [
    { id: 'rain', name: 'Rain', emoji: '🌧️', color: '#60a5fa', url: 'https://raw.githubusercontent.com/mudar-hussain/Be_Relax/main/audio/rain.mp3' },
    { id: 'forest', name: 'Forest', emoji: '🌲', color: '#10b981', url: 'https://raw.githubusercontent.com/mudar-hussain/Be_Relax/main/audio/forest.mp3' },
    { id: 'waves', name: 'Waves', emoji: '🌊', color: '#34d399', url: 'https://raw.githubusercontent.com/mudar-hussain/Be_Relax/main/audio/waves.mp3' },
    { id: 'stream', name: 'Stream', emoji: '💧', color: '#38bdf8', url: 'https://raw.githubusercontent.com/mudar-hussain/Be_Relax/main/audio/stream.mp3' },
    { id: 'park', name: 'City Park', emoji: '⛲', color: '#94a3b8', url: 'https://raw.githubusercontent.com/mudar-hussain/Be_Relax/main/audio/park.mp3' },
    { id: 'fire', name: 'Fire', emoji: '🔥', color: '#f87171', url: 'https://raw.githubusercontent.com/bradtraversy/ambient-sound-mixer/main/audio/fireplace.mp3' },
];

const motivationalQuotes = [
    "Incredible work. You crushed that session.",
    "Focus is a superpower. You just used it.",
    "Step by step. You're building something great.",
    "Time well spent. Take a breather.",
    "Another milestone reached. Keep up the momentum.",
];

export default function FocusTimer() {
    const [initialTime, setInitialTime] = useState(0); // in seconds
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [celebrationText, setCelebrationText] = useState("");
    const { width, height } = useWindowSize(); // For confetti

    // Local string state for inputs to allow smooth typing (including backspacing)
    const [minStr, setMinStr] = useState("00");
    const [secStr, setSecStr] = useState("00");
    const [activeSound, setActiveSound] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    // Synchronize inputs when initialTime changes (e.g., from presets)
    useEffect(() => {
        if (!isActive) {
            const m = Math.floor(initialTime / 60);
            const s = initialTime % 60;
            setMinStr(m.toString().padStart(2, '0'));
            setSecStr(s.toString().padStart(2, '0'));
        }
    }, [initialTime, isActive]);

    const toggleSound = (soundId: string) => {
        const sound = natureSounds.find(s => s.id === soundId);
        if (!sound) return;

        if (activeSound === soundId) {
            // Stop current sound smoothly
            const audio = audioRefs.current[soundId];
            if (audio) {
                // Fade out before stopping
                audio.pause();
                audio.currentTime = 0;
            }
            setActiveSound(null);
        } else {
            // Stop existing sound if any
            if (activeSound && audioRefs.current[activeSound]) {
                audioRefs.current[activeSound].pause();
                audioRefs.current[activeSound].currentTime = 0;
            }

            // Start new sound
            if (!audioRefs.current[soundId]) {
                const audio = new Audio(sound.url);
                audio.crossOrigin = "anonymous";
                audio.loop = true;
                audio.volume = 1.0; // Boosted volume to max as requested
                audio.load(); // Explicitly load
                audioRefs.current[soundId] = audio;
            }

            const playPromise = audioRefs.current[soundId].play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setActiveSound(soundId))
                    .catch(e => {
                        console.error("Audio playback failed", e);
                        setActiveSound(null);
                    });
            }
        }
    };

    // Ask for notification permissions on load
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        // Cleanup audio on unmount
        return () => {
            Object.values(audioRefs.current).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }, []);

    const startTimer = () => {
        if (timeLeft <= 0) return;
        setIsActive(true);
        setIsFinished(false);
    };

    const pauseTimer = () => {
        setIsActive(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsFinished(false);
        setTimeLeft(initialTime);
    };

    const handleFinish = () => {
        setIsActive(false);
        setIsFinished(true);
        setCelebrationText(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

        // Trigger notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Focus Session Complete ✨", {
                body: "Great job! Time to take a quick break.",
                icon: "/favicon.ico"
            });
        }

        // Play Sound
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContext();

            // Generate a simple, pleasant chime (two notes)
            const playNote = (freq: number, startTime: number, duration: number) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

                gain.gain.setValueAtTime(0, audioCtx.currentTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = audioCtx.currentTime;
            playNote(523.25, now, 1);    // C5
            playNote(659.25, now + 0.15, 1.5);  // E5
            playNote(783.99, now + 0.3, 2);   // G5
        } catch (e) {
            console.error("Audio API not supported", e);
        }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (isActive && timeLeft <= 0) {
            handleFinish();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handlePreset = (mins: number) => {
        const total = mins * 60;
        setInitialTime(total);
        setTimeLeft(total);
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
        setMinStr(val);

        const m = parseInt(val) || 0;
        const s = parseInt(secStr) || 0;
        const total = m * 60 + s;
        setInitialTime(total);
        setTimeLeft(total);
    };

    const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
        const sVal = parseInt(val) || 0;
        if (sVal > 59) val = "59";

        setSecStr(val);

        const m = parseInt(minStr) || 0;
        const s = parseInt(val) || 0;
        const total = m * 60 + s;
        setInitialTime(total);
        setTimeLeft(total);
    };

    const handleInputBlur = () => {
        setMinStr(prev => prev.padStart(2, '0'));
        setSecStr(prev => prev.padStart(2, '0'));
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const progress = initialTime > 0 ? 1 - (timeLeft / initialTime) : 0;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h2 className={styles.title}>Focus</h2>
                    <p className={styles.subtitle}>Deep work sessions</p>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {!isFinished ? (
                    <motion.div
                        key="timer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={styles.mainGrid}
                    >
                        {/* 1. Left Sidebar / Spacer */}
                        <div className={styles.sideArea} aria-hidden="true" />

                        {/* 2. Center Content Area */}
                        <div className={styles.centerArea}>
                            <div className={styles.timerCard}>
                                <div className={styles.ringContainer}>
                                    <svg className={styles.ringSvg} viewBox="0 0 100 100">
                                        <circle
                                            cx="50" cy="50" r="46"
                                            className={styles.ringBg}
                                        />
                                        <circle
                                            cx="50" cy="50" r="46"
                                            className={styles.ringProgress}
                                            style={{ strokeDashoffset: `${289 * (1 - progress)}` }}
                                        />
                                    </svg>

                                    {(!isActive && !isFinished) ? (
                                        <div className={styles.timeInputWrapper}>
                                            <input
                                                className={styles.timeNumericInput}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={minStr}
                                                onChange={handleMinutesChange}
                                                onBlur={handleInputBlur}
                                                onFocus={(e) => e.target.select()}
                                                aria-label="Minutes"
                                            />
                                            <span className={styles.timeColon}>:</span>
                                            <input
                                                className={styles.timeNumericInput}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={secStr}
                                                onChange={handleSecondsChange}
                                                onBlur={handleInputBlur}
                                                onFocus={(e) => e.target.select()}
                                                aria-label="Seconds"
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.timeValue}>{formatTime(timeLeft)}</div>
                                    )}
                                </div>

                                <div className={styles.controls}>
                                    <button
                                        className={`${styles.mainBtn} ${isActive ? styles.pauseBtn : styles.startBtn}`}
                                        onClick={isActive ? pauseTimer : startTimer}
                                    >
                                        {isActive ? <Pause size={24} /> : <Play size={24} />}
                                    </button>

                                    <button className={styles.actionBtn} onClick={resetTimer} title="Reset">
                                        <RotateCcw size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Right Ambient Panel */}
                        <aside className={styles.ambientPanel}>
                            <div className={styles.ambientContainer}>
                                <p className={styles.ambientLabel}>Ambient</p>
                                <div className={styles.soundGrid}>
                                    {natureSounds.map((sound) => {
                                        return (
                                            <div key={sound.id} className={styles.soundItem}>
                                                <button
                                                    className={`${styles.soundBtn} ${activeSound === sound.id ? styles.activeSound : ''}`}
                                                    onClick={() => toggleSound(sound.id)}
                                                    title={sound.name}
                                                    style={{ "--accent-color": sound.color } as any}
                                                >
                                                    <span className={styles.emojiIcon}>{sound.emoji}</span>
                                                </button>
                                                <span className={styles.soundName}>{sound.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>
                    </motion.div>
                ) : (
                    <motion.div
                        key="celebration"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={styles.celebration}
                    >
                        <Confetti
                            width={width}
                            height={height}
                            recycle={false}
                            numberOfPieces={400}
                            gravity={0.15}
                            colors={['#0071e3', '#ff3b30', '#ff9500', '#34c759', '#af52de']}
                            style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
                        />
                        <div className={styles.celebrationIcon}>✨</div>
                        <h3 className={styles.celebrationTitle}>Session Complete</h3>
                        <p className={styles.celebrationQuote}>"{celebrationText}"</p>
                        <button className={styles.restartBtn} onClick={resetTimer}>
                            Start Another Session
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
