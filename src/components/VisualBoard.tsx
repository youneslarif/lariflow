"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore, BoardElement, BoardConnection, BoardDrawing, DrawingPoint } from "@/lib/Store";
import { Plus, Image as ImageIcon, Type, Trash2, Link as LinkIcon, Edit2, PenTool, MousePointer2, Undo2 } from "lucide-react";
import styles from "./VisualBoard.module.css";

export default function VisualBoard() {
    const { state, setState } = useStore();
    const boardRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Drawing states
    const [mode, setMode] = useState<"select" | "draw" | "link">("select");
    const [currentDrawing, setCurrentDrawing] = useState<DrawingPoint[] | null>(null);
    const [resizing, setResizing] = useState<{ id: string; startX: number; startWidth: number } | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (linkingFrom && boardRef.current) {
                const rect = boardRef.current.getBoundingClientRect();
                setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [linkingFrom]);

    // Pointer events for drawing
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (mode === "draw" && boardRef.current) {
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = boardRef.current.getBoundingClientRect();
            setCurrentDrawing([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (mode === "draw" && currentDrawing && boardRef.current) {
            const rect = boardRef.current.getBoundingClientRect();
            setCurrentDrawing([...currentDrawing, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (mode === "draw" && currentDrawing) {
            e.currentTarget.releasePointerCapture(e.pointerId);
            if (currentDrawing.length > 2) {
                const newDrawing: BoardDrawing = {
                    id: Math.random().toString(36).substring(2, 9),
                    points: currentDrawing,
                    color: "var(--text-primary)"
                };
                setState(prev => ({
                    ...prev,
                    boardDrawings: [...(prev.boardDrawings || []), newDrawing]
                }));
            }
            setCurrentDrawing(null);
        }
    };

    const undoDrawing = () => {
        setState(prev => {
            const drawings = prev.boardDrawings || [];
            if (drawings.length === 0) return prev;
            return {
                ...prev,
                boardDrawings: drawings.slice(0, -1)
            };
        });
    };

    const addElement = (type: "text" | "image") => {
        const newEl: BoardElement = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: window.innerWidth / 2 - 100,
            y: window.innerHeight / 2 - 100,
            content: type === "text" ? "NEW IDEA" : "",
            color: "#ffffff"
        };
        setState(prev => ({ ...prev, boardElements: [...prev.boardElements, newEl] }));
        setMode("select"); // Return to select mode when adding element
    };

    const updateElementWidth = (id: string, width: number) => {
        setState(prev => ({
            ...prev,
            boardElements: prev.boardElements.map(el =>
                el.id === id ? { ...el, width: Math.max(160, width) } : el
            )
        }));
    };

    // Global mouse handlers for resizing
    useEffect(() => {
        if (!resizing) return;
        const handleMouseMove = (e: MouseEvent) => {
            const delta = e.clientX - resizing.startX;
            updateElementWidth(resizing.id, resizing.startWidth + delta);
        };
        const handleMouseUp = () => setResizing(null);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [resizing]);

    const handleDragEnd = (id: string, info: any) => {
        setState(prev => ({
            ...prev,
            boardElements: prev.boardElements.map(el => {
                if (el.id === id) {
                    return { ...el, x: el.x + info.offset.x, y: el.y + info.offset.y };
                }
                return el;
            })
        }));
    };

    const updateContent = (id: string, content: string) => {
        setState(prev => ({
            ...prev,
            boardElements: prev.boardElements.map(el => el.id === id ? { ...el, content } : el)
        }));
    };

    const deleteElement = (id: string) => {
        setState(prev => ({
            ...prev,
            boardElements: prev.boardElements.filter(el => el.id !== id),
            boardConnections: prev.boardConnections.filter(c => c.fromId !== id && c.toId !== id)
        }));
    };

    const startLinking = (id: string) => {
        setLinkingFrom(id);
    };

    const finishLinking = (id: string) => {
        if (linkingFrom && linkingFrom !== id) {
            // Check if connection already exists
            const exists = state.boardConnections.some(c =>
                (c.fromId === linkingFrom && c.toId === id) ||
                (c.fromId === id && c.toId === linkingFrom)
            );

            if (!exists) {
                const newConn: BoardConnection = {
                    id: Math.random().toString(36).substr(2, 9),
                    fromId: linkingFrom,
                    toId: id,
                };
                setState(prev => ({ ...prev, boardConnections: [...prev.boardConnections, newConn] }));
            }
        }
        setLinkingFrom(null);
    };

    const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    updateContent(id, event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const renderConnection = (conn: BoardConnection) => {
        const fromEl = state.boardElements.find(e => e.id === conn.fromId);
        const toEl = state.boardElements.find(e => e.id === conn.toId);
        if (!fromEl || !toEl) return null;

        const fromW = fromEl.width || 280;
        const toW = toEl.width || 280;
        const fromH = cardRefs.current[fromEl.id]?.offsetHeight || 120;
        const toH = cardRefs.current[toEl.id]?.offsetHeight || 120;

        const x1 = fromEl.x + fromW / 2;
        const y1 = fromEl.y + fromH / 2;
        const x2 = toEl.x + toW / 2;
        const y2 = toEl.y + toH / 2;

        const path = `M ${x1} ${y1} L ${x2} ${y2}`;

        return (
            <path
                key={conn.id}
                d={path}
                stroke="var(--border-strong)"
                strokeWidth="2"
                fill="none"
                className={styles.animatePath}
            />
        );
    };

    const renderLinkingLine = () => {
        if (!linkingFrom) return null;
        const fromEl = state.boardElements.find(e => e.id === linkingFrom);
        if (!fromEl) return null;

        const fromW = fromEl.width || 280;
        const fromH = cardRefs.current[fromEl.id]?.offsetHeight || 120;
        const x1 = fromEl.x + fromW / 2;
        const y1 = fromEl.y + fromH / 2;
        const path = `M ${x1} ${y1} L ${mousePos.x} ${mousePos.y}`;

        return (
            <path
                d={path}
                stroke="var(--accent-blue)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 4"
            />
        );
    };

    const renderDrawing = (pts: DrawingPoint[], key: string, color: string) => {
        if (pts.length < 2) return null;
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
        return (
            <path key={key} d={path} stroke={color} strokeWidth="3" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <button className={`${styles.toolBtn} ${mode === "select" ? styles.activeTool : ""}`} onClick={() => { setMode("select"); setLinkingFrom(null); }} title="Select Tool">
                    <MousePointer2 size={18} />
                    <span>Select</span>
                </button>
                <button className={`${styles.toolBtn} ${mode === "draw" ? styles.activeTool : ""}`} onClick={() => { setMode("draw"); setLinkingFrom(null); }} title="Draw Tool">
                    <PenTool size={18} />
                    <span>Draw</span>
                </button>
                <button className={`${styles.toolBtn} ${mode === "link" ? styles.activeTool : ""}`} onClick={() => { setMode("link"); setLinkingFrom(null); }} title="Link Tool">
                    <LinkIcon size={18} />
                    <span>Link</span>
                </button>
                <button className={styles.toolBtn} onClick={undoDrawing} title="Undo Drawing" disabled={!(state.boardDrawings?.length)}>
                    <Undo2 size={18} />
                </button>

                <div className={styles.divider} />

                <button className={styles.toolBtn} onClick={() => addElement("text")} title="Add Text Card">
                    <Type size={18} />
                    <span>Add Text</span>
                </button>
                <button className={styles.toolBtn} onClick={() => addElement("image")} title="Add Image Card">
                    <ImageIcon size={18} />
                    <span>Add Image</span>
                </button>
            </div>

            <div
                className={`${styles.board} ${mode === "draw" ? styles.drawingMode : ""} ${mode === "link" ? styles.linkingMode : ""}`}
                ref={boardRef}
                onClick={() => { if (linkingFrom) setLinkingFrom(null); }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <svg className={styles.svgLayer}>
                    {state.boardConnections.map(renderConnection)}
                    {renderLinkingLine()}
                    {(state.boardDrawings || []).map(d => renderDrawing(d.points, d.id, d.color))}
                    {currentDrawing && renderDrawing(currentDrawing, "current", "var(--text-primary)")}
                </svg>

                {state.boardElements.map(el => (
                    <motion.div
                        key={el.id}
                        ref={(node: HTMLDivElement | null) => { cardRefs.current[el.id] = node; }}
                        drag={mode === "select" && !linkingFrom}
                        dragMomentum={false}
                        onDragEnd={(e, info) => handleDragEnd(el.id, info)}
                        initial={{ x: el.x, y: el.y, opacity: 0, scale: 0.9 }}
                        animate={{ x: el.x, y: el.y, opacity: 1, scale: 1 }}
                        className={`${styles.card} ${linkingFrom === el.id ? styles.linkingFrom : ''} ${(linkingFrom || mode === 'link') && linkingFrom !== el.id ? styles.linkTarget : ''}`}
                        style={{ position: "absolute", zIndex: linkingFrom === el.id ? 100 : 10, width: el.width || 280 }}
                        onClick={(e) => {
                            // Link mode: first click = source, second click = target
                            if (mode === "link") {
                                e.stopPropagation();
                                if (!linkingFrom) {
                                    setLinkingFrom(el.id);
                                } else if (linkingFrom !== el.id) {
                                    finishLinking(el.id);
                                }
                                return;
                            }
                            // Select mode with active link (from card header button)
                            if (mode === "select" && linkingFrom) {
                                e.stopPropagation();
                                finishLinking(el.id);
                            }
                        }}
                        onPointerDown={(e) => {
                            if (mode === "draw") {
                                e.preventDefault();
                            } else if (mode === "link") {
                                e.stopPropagation();
                            } else if (!linkingFrom) {
                                e.stopPropagation();
                            }
                        }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.dragHandle} />
                            <div className={styles.cardActions}>
                                <button
                                    className={styles.actionBtn}
                                    onPointerDown={(e) => { e.stopPropagation(); startLinking(el.id); }}
                                    title="Connect"
                                >
                                    <LinkIcon size={12} />
                                </button>
                                <button
                                    className={styles.actionBtn}
                                    onPointerDown={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.cardContent}>
                            {el.type === "text" && (
                                <textarea
                                    className={styles.textArea}
                                    value={el.content}
                                    onChange={(e) => updateContent(el.id, e.target.value)}
                                    placeholder="ENTER TEXT..."
                                    onPointerDown={(e) => { if (mode === "select") e.stopPropagation() }}
                                />
                            )}

                            {el.type === "image" && (
                                <div className={styles.imageContainer} onPointerDown={(e) => { if (mode === "select") e.stopPropagation() }}>
                                    {el.content ? (
                                        <img src={el.content} alt="Board Element" className={styles.image} draggable={false} />
                                    ) : (
                                        <label className={styles.uploadLabel}>
                                            <ImageIcon size={24} className={styles.uploadIcon} />
                                            <span>Upload Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className={styles.fileInput}
                                                onChange={(e) => handleImageUpload(el.id, e)}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Resize handle */}
                        <div
                            className={styles.resizeHandle}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                setResizing({ id: el.id, startX: e.clientX, startWidth: el.width || 280 });
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            <div className={styles.bgGrid} />
        </div>
    );
}
