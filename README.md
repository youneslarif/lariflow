<<<<<<< HEAD
# Planez Productivity App ✈️

Welcome to **Planez**, a luxury minimalist personal productivity space. 

I built this project because I was tired of complex systems like Notion, ClickUp, and Jira. I wanted a personal space that felt clean, extremely fast, and inspired by Apple's beautiful iOS design language. 

No databases. No loading screens. No complex onboarding.

Everything in Planez lives entirely in your browser using local storage, making it completely private and trivially easy to set up.

## Features: The 4 Spaces

Planez focuses strictly on four core spaces to organize your life:

1. **Agenda / Goals Calendar**: A simple visual grid to place colorful goals on specific days.
2. **Daily Tasks**: A focused checklist for today, sorted automatically by high, medium, and low priority.
3. **Knowledge Notes**: A modern block-style editor. Press a button to add a heading, a text block, or a quote. Change colors freely to highlight ideas.
4. **Visual Board**: A massive freeform canvas where you can drag and drop text cards, upload images, and connect them with arrows. Think of it as your personal strategy room.

## Technical Architecture

Under the hood, this is deeply optimized and purposefully simple. I built it specifically ignoring heavy UI libraries to maintain complete command over the visual aesthetic.

- **Next.js 15 (App Router)**: Fast, modern, and clean.
- **Vanilla CSS Modules**: No Tailwind. Every shadow, gradient, and padding is handcrafted using CSS variables inside `globals.css` to hit that premium iOS feel.
- **Framer Motion**: Powers the smooth drag-and-drop mechanics of the Visual Board.
- **Local Storage Context**: Uses a simple React Context API wrapper combined with LocalStorage. Your data never leaves your machine.

## How to Run Locally

Since there are no databases or environment variables to configure, running this project takes less than 10 seconds:

```bash
# 1. Clone or download the project
# 2. Install dependencies
npm install

# 3. Start the application
npm run dev
```

Open `http://localhost:3000` in your browser. Start managing your life.

---

*Built for those who value focus, simplicity, and beautiful design.*
=======
# lariflow
A minimalist productivity workspace with focus timer, visual roadmap board, tasks, and notes.
>>>>>>> 0bb33671e79c0e4f4be131b28ca4205e0036cf6a
