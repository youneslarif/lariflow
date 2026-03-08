"use client";

import { useState } from "react";
import { useStore, Note, NoteBlock } from "@/lib/Store";
import { Plus, Trash2, Heading1, Heading2, Type, Quote, Palette } from "lucide-react";
import styles from "./KnowledgeNotes.module.css";

const colors = ["transparent", "#fceabb", "#f8b500", "#ff7b54", "#e8e8e8"];

export default function KnowledgeNotes() {
    const { state, setState } = useStore();
    const [activeNoteId, setActiveNoteId] = useState<string | null>(state.notes[0]?.id || null);

    const activeNote = state.notes.find(n => n.id === activeNoteId);

    const createNote = () => {
        const newNote: Note = {
            id: Math.random().toString(36).substr(2, 9),
            title: "Untitled Note",
            blocks: [{ id: "b1", type: "text", content: "" }],
            updatedAt: Date.now(),
        };
        setState(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
        setActiveNoteId(newNote.id);
    };

    const deleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const remaining = state.notes.filter(n => n.id !== id);
        if (activeNoteId === id) {
            setActiveNoteId(remaining[0]?.id || null);
        }
        setState(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
    };

    const updateTitle = (title: string) => {
        if (!activeNoteId) return;
        setState(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === activeNoteId ? { ...n, title, updatedAt: Date.now() } : n)
        }));
    };

    const addBlock = (type: NoteBlock["type"]) => {
        if (!activeNoteId) return;
        const newBlock: NoteBlock = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: "",
            color: "transparent"
        };
        setState(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === activeNoteId ? { ...n, blocks: [...n.blocks, newBlock] } : n)
        }));
    };

    const updateBlock = (blockId: string, content: string) => {
        if (!activeNoteId) return;
        setState(prev => ({
            ...prev,
            notes: prev.notes.map(n => {
                if (n.id !== activeNoteId) return n;
                return {
                    ...n,
                    blocks: n.blocks.map(b => b.id === blockId ? { ...b, content } : b)
                };
            })
        }));
    };

    const setBlockColor = (blockId: string, color: string) => {
        if (!activeNoteId) return;
        setState(prev => ({
            ...prev,
            notes: prev.notes.map(n => {
                if (n.id !== activeNoteId) return n;
                return {
                    ...n,
                    blocks: n.blocks.map(b => b.id === blockId ? { ...b, color } : b)
                };
            })
        }));
    };

    const removeBlock = (blockId: string) => {
        if (!activeNoteId) return;
        setState(prev => ({
            ...prev,
            notes: prev.notes.map(n => {
                if (n.id !== activeNoteId) return n;
                return {
                    ...n,
                    blocks: n.blocks.filter(b => b.id !== blockId)
                };
            })
        }));
    };

    return (
        <div className={styles.container}>
            {/* Sidebar List of Notes */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3 className={styles.sidebarTitle}>Notes</h3>
                    <button onClick={createNote} className={styles.iconBtn}><Plus size={18} /></button>
                </div>

                <div className={styles.notesList}>
                    {state.notes.length === 0 && <p className={styles.emptyText}>No notes yet</p>}
                    {state.notes.map(note => (
                        <div
                            key={note.id}
                            className={`${styles.noteItem} ${activeNoteId === note.id ? styles.active : ""}`}
                            onClick={() => setActiveNoteId(note.id)}
                        >
                            <div className={styles.noteItemText}>
                                <span className={styles.noteItemTitle}>{note.title || "Untitled Note"}</span>
                                <span className={styles.noteItemDate}>{new Date(note.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <button
                                className={styles.deleteNoteBtn}
                                onClick={(e) => deleteNote(note.id, e)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Editor */}
            <div className={styles.editor}>
                {activeNote ? (
                    <div className={styles.editorContent}>
                        <input
                            type="text"
                            className={styles.docTitle}
                            value={activeNote.title}
                            onChange={(e) => updateTitle(e.target.value)}
                            placeholder="Untitled"
                        />

                        <div className={styles.blocksContainer}>
                            {activeNote.blocks.map(block => (
                                <div key={block.id} className={styles.blockRow}>
                                    <div className={styles.blockControls}>
                                        <button onClick={() => removeBlock(block.id)} className={styles.controlBtn}><Trash2 size={12} /></button>
                                        <div className={styles.colorPickerWrap}>
                                            <button className={styles.controlBtn}><Palette size={12} /></button>
                                            <div className={styles.colorPicker}>
                                                {colors.map(c => (
                                                    <div
                                                        key={c}
                                                        className={styles.colorSwatch}
                                                        style={{ backgroundColor: c === "transparent" ? "#fff" : c, border: c === "transparent" ? "1px solid #ddd" : "none" }}
                                                        onClick={() => setBlockColor(block.id, c)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {block.type === "h1" && (
                                        <input className={`${styles.blockShared} ${styles.h1}`} value={block.content} onChange={e => updateBlock(block.id, e.target.value)} placeholder="Heading 1" style={{ backgroundColor: block.color }} />
                                    )}
                                    {block.type === "h2" && (
                                        <input className={`${styles.blockShared} ${styles.h2}`} value={block.content} onChange={e => updateBlock(block.id, e.target.value)} placeholder="Heading 2" style={{ backgroundColor: block.color }} />
                                    )}
                                    {block.type === "text" && (
                                        <textarea
                                            className={`${styles.blockShared} ${styles.text}`}
                                            value={block.content}
                                            onChange={e => updateBlock(block.id, e.target.value)}
                                            placeholder="Type something..."
                                            style={{ backgroundColor: block.color }}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = target.scrollHeight + 'px';
                                            }}
                                        />
                                    )}
                                    {block.type === "quote" && (
                                        <textarea
                                            className={`${styles.blockShared} ${styles.quote}`}
                                            value={block.content}
                                            onChange={e => updateBlock(block.id, e.target.value)}
                                            placeholder="Quote..."
                                            style={{ backgroundColor: block.color }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.addBlockMenu}>
                            <span className={styles.addBlockHint}>Add block:</span>
                            <button onClick={() => addBlock("text")} className={styles.addBlockBtn}><Type size={14} /> Text</button>
                            <button onClick={() => addBlock("h1")} className={styles.addBlockBtn}><Heading1 size={14} /> H1</button>
                            <button onClick={() => addBlock("h2")} className={styles.addBlockBtn}><Heading2 size={14} /> H2</button>
                            <button onClick={() => addBlock("quote")} className={styles.addBlockBtn}><Quote size={14} /> Quote</button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.noNoteState}>
                        Select or create a note.
                    </div>
                )}
            </div>
        </div>
    );
}
