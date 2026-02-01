'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QUESTIONS = [
  {
    key: 'role',
    question: "What's your role?",
    options: ['Founder', 'Developer', 'Marketer', 'Researcher', 'Executive', 'Other']
  },
  {
    key: 'industry',
    question: 'What industry are you in?',
    options: ['Tech', 'Finance', 'Healthcare', 'Education', 'Media', 'Other']
  },
  {
    key: 'interests',
    question: 'Which AI topics interest you most?',
    options: ['LLMs', 'Agents', 'Tools', 'Robotics', 'Policy', 'Business'],
    multiple: true
  },
  {
    key: 'tone',
    question: 'How technical should we get?',
    options: ['Plain English', 'Balanced', 'Deep Technical']
  },
  {
    key: 'depth',
    question: 'How much detail do you want?',
    options: ['Just Headlines', 'Key Points', 'Full Analysis']
  },
  {
    key: 'vibe',
    question: "What's your vibe?",
    options: ['Straight to Business', 'Conversational', 'Inject Some Humor']
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  function handleSelect(option: string) {
    if (current.multiple) {
      const existing = (answers[current.key] as string[]) || [];
      const updated = existing.includes(option)
        ? existing.filter(o => o !== option)
        : [...existing, option];
      setAnswers({ ...answers, [current.key]: updated });
    } else {
      setAnswers({ ...answers, [current.key]: option.toLowerCase().replace(/ /g, '_') });
      if (!isLast) {
        setTimeout(() => setStep(step + 1), 300);
      }
    }
  }

  async function handleFinish() {
    setLoading(true);

    const payload = {
      role: answers.role || 'other',
      industry: answers.industry || 'tech',
      interests: answers.interests || ['llms'],
      tone: answers.tone || 'balanced',
      depth: answers.depth || 'key_points',
      vibe: answers.vibe || 'conversational'
    };

    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    router.push('/feed');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8">
        <div className="mb-8">
          <div className="flex gap-1 mb-4">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Question {step + 1} of {QUESTIONS.length}</p>
        </div>

        <h1 className="text-2xl font-bold mb-6">{current.question}</h1>

        <div className="space-y-3">
          {current.options.map(option => {
            const isSelected = current.multiple
              ? ((answers[current.key] as string[]) || []).includes(option)
              : answers[current.key] === option.toLowerCase().replace(/ /g, '_');

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {(current.multiple || isLast) && (
          <button
            onClick={isLast ? handleFinish : () => setStep(step + 1)}
            disabled={loading || (current.multiple && !answers[current.key]?.length)}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isLast ? 'Start Reading' : 'Continue'}
          </button>
        )}
      </div>
    </main>
  );
}
