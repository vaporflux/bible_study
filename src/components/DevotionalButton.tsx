"use client";

interface DevotionalButtonProps {
  onClick: () => void;
}

export default function DevotionalButton({ onClick }: DevotionalButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Open daily devotional"
      className="fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-light text-leather shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    </button>
  );
}
