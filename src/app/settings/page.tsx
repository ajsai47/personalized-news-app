'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const OPTIONS = {
  role: ['founder', 'developer', 'marketer', 'researcher', 'executive', 'other'],
  industry: ['tech', 'finance', 'healthcare', 'education', 'media', 'other'],
  interests: ['llms', 'agents', 'tools', 'robotics', 'policy', 'business'],
  tone: ['plain_english', 'balanced', 'deep_technical'],
  depth: ['just_headlines', 'key_points', 'full_analysis'],
  vibe: ['straight_to_business', 'conversational', 'inject_some_humor']
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    router.push('/feed');
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <a href="/feed" className="text-blue-600 hover:underline">Back to Feed</a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {Object.entries(OPTIONS).map(([key, options]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key.replace('_', ' ')}
              </label>
              {key === 'interests' ? (
                <div className="flex flex-wrap gap-2">
                  {options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        const current = (settings.interests as string[]) || [];
                        const updated = current.includes(opt)
                          ? current.filter(i => i !== opt)
                          : [...current, opt];
                        setSettings({ ...settings, interests: updated });
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        ((settings.interests as string[]) || []).includes(opt)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  value={(settings[key] as string) || ''}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {options.map(opt => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}