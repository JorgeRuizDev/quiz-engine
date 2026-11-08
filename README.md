# 🧠 Quiz Engine

A modular, extensible questionnaire engine and UI component framework built for modern web applications.

`quiz-engine` separates the pure scoring, spaced-repetition sequencing, and data validation logic from the interactive presentation layer, making it trivial to embed rich educational quizzes across multiple websites while allowing new question types and custom visual components.

---

## 📦 Architecture

```
@quiz-engine/
├── core/                  # Pure TypeScript (zero DOM/browser dependencies)
│   ├── types/             # Zod schemas, session and event contracts
│   ├── engine/            # Carousel sequencing, Evaluator, Filter, PackLoader
│   ├── registry/          # VisualRegistry & QuestionTypeRegistry
│   └── storage/           # Storage adapters (localStorage, MemoryStorage)
└── react/                 # React UI layer
    ├── hooks/             # useQuizSession, useQuizPostMessage, useQuizUrlParams
    └── components/        # QuizRunner, QuestionView, OptionGrid, RemediationCard...
```

---

## 🚀 Quickstart (Complete UI in 5 Minutes)

```tsx
import React from 'react';
import { QuizRunner } from 'quiz-engine';
// Or import { QuizRunner } from 'quiz-engine/react';

export default function MyQuizPage() {
  const questions = [
    {
      id: 'q1',
      type: 'single-choice',
      course: 1,
      difficulty: 'beginner',
      topics: ['basics'],
      notation: 'neutral',
      prompt: { en: 'What is 2 + 2?', es: '¿Cuánto es 2 + 2?' },
      options: [
        { id: 'opt-3', label: { en: '3', es: '3' } },
        { id: 'opt-4', label: { en: '4', es: '4' } },
        { id: 'opt-5', label: { en: '5', es: '5' } },
      ],
      correctAnswer: ['opt-4'],
      remediation: {
        explanation: { en: '2 + 2 equals 4.', es: '2 + 2 es igual a 4.' },
      },
    },
  ];

  return <QuizRunner questions={questions} lang="en" />;
}
```

---

## 🔌 Extensibility: Adding New Question Types

One of `quiz-engine`'s standout features is the ability to register brand new question types without modifying the core library.

### Example: Registering an Ordering / Sequence Question Type

```tsx
import { questionTypeRegistry } from 'quiz-engine';

// 1. Register evaluator and optional custom component
questionTypeRegistry.register({
  type: 'order-sequence',
  evaluator: (question, userAnswer: string[]) => {
    const expected = question.correctAnswer as string[];
    const isCorrect =
      Array.isArray(userAnswer) &&
      userAnswer.length === expected.length &&
      userAnswer.every((val, idx) => val === expected[idx]);

    return {
      isCorrect,
      details: { expected, received: userAnswer },
    };
  },
  component: OrderSequenceComponent, // Custom React component
});
```

Now, any question with `type: 'order-sequence'` will automatically use your custom component for rendering and your custom evaluator for grading!

---

## 🎨 Extensibility: Registering Custom Visual Stimulators

Visual stimuli (such as fretboards, pianos, mathematical graphs, or anatomy diagrams) can be registered into `visualRegistry`:

```tsx
import { visualRegistry } from 'quiz-engine';
import { PianoKeyboardVisualizer } from './components/PianoKeyboardVisualizer';

// Register the custom visualizer
visualRegistry.register('piano-keyboard', ({ props, lang, compact }) => {
  return <PianoKeyboardVisualizer highlightKeys={props.keys} lang={lang} />;
});
```

Whenever a question includes:
```json
{
  "stimulus": {
    "visualType": "piano-keyboard",
    "visualProps": { "keys": ["C4", "E4", "G4"] }
  }
}
```
The quiz engine automatically resolves and renders your custom visualizer!

---

## 🕹️ Headless Mode (Custom UI with `useQuizSession`)

If you want complete control over the UI, you can use the headless hook:

```tsx
import { useQuizSession } from 'quiz-engine';

export function CustomQuiz() {
  const { state, selectOption, submitAnswer, nextQuestion, resetSession } =
    useQuizSession(questions, { difficulty: 'beginner' });

  const { activeQuestion, status, stats } = state;

  return (
    <div>
      <h3>Streak: {stats.currentStreak}</h3>
      <h2>{activeQuestion?.prompt.en}</h2>
      {activeQuestion?.options.map((opt) => (
        <button key={opt.id} onClick={() => selectOption(opt.id)}>
          {opt.label.en}
        </button>
      ))}
      <button onClick={submitAnswer}>Check</button>
    </div>
  );
}
```

---

## 📤 Moving to its Own Standalone Repository

This folder is completely self-contained. To publish it or move it to a dedicated GitHub repository:

```bash
cd packages/quiz-engine
git init
git add .
git commit -m "Initial commit of quiz-engine library"
git remote add origin https://github.com/your-username/quiz-engine.git
git branch -M main
git push -u origin main
```

To install in other projects:
```bash
# Via NPM (once published)
npm install quiz-engine

# Or directly from GitHub
bun add git+https://github.com/your-username/quiz-engine.git
```
