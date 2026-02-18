"use client";

const PROMPTS = [
  {
    icon: "📖",
    title: "Explain Romans 9",
    description: "Dive into election and sovereignty",
  },
  {
    icon: "🏛️",
    title: "Historical context of Revelation",
    description: "First-century apocalyptic literature",
  },
  {
    icon: "✝️",
    title: "What are the five points of Calvinism?",
    description: "TULIP explained with Scripture",
  },
  {
    icon: "🗺️",
    title: "Archaeological evidence for the Exodus",
    description: "What does archaeology tell us?",
  },
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt.title}
          onClick={() => onSelect(prompt.title)}
          className="text-left p-4 rounded-xl border border-parchment-dark/60 bg-white/50 hover:bg-white/80 hover:border-gold/40 hover:shadow-md transition-all duration-200 group"
        >
          <span className="text-lg mb-1 block">{prompt.icon}</span>
          <span className="font-display font-semibold text-leather text-sm block group-hover:text-ink transition-colors">
            {prompt.title}
          </span>
          <span className="text-xs text-ink-light/70 mt-0.5 block">
            {prompt.description}
          </span>
        </button>
      ))}
    </div>
  );
}
