import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getPersonalizedSegments, Segment } from '@/lib/segments';

function SegmentCard({ segment }: { segment: Segment }) {
  const typeColors = {
    main_news: 'bg-blue-100 text-blue-800',
    top_tools: 'bg-green-100 text-green-800',
    quick_news: 'bg-purple-100 text-purple-800'
  };

  const content = segment.personalizedContent || segment.originalContent;

  return (
    <article className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[segment.type as keyof typeof typeColors] || 'bg-gray-100'}`}>
          {segment.type.replace('_', ' ')}
        </span>
        {segment.topics.slice(0, 3).map(topic => (
          <span key={topic} className="px-2 py-1 bg-gray-100 rounded text-xs">
            {topic}
          </span>
        ))}
        {segment.personalizedContent && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
            personalized
          </span>
        )}
      </div>
      <h2 className="text-xl font-bold mb-3">{segment.title}</h2>
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const segments = await getPersonalizedSegments(session.userId);

  const mainNews = segments.filter(s => s.type === 'main_news');
  const topTools = segments.filter(s => s.type === 'top_tools');
  const quickNews = segments.filter(s => s.type === 'quick_news');

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your AI News Feed</h1>
          <a href="/settings" className="text-blue-600 hover:underline">Settings</a>
        </div>

        {segments.length === 0 ? (
          <p className="text-gray-600">No news yet. Check back soon!</p>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Main News</h2>
              {mainNews.map(seg => <SegmentCard key={seg.id} segment={seg} />)}
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Top Tools</h2>
              {topTools.map(seg => <SegmentCard key={seg.id} segment={seg} />)}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick News</h2>
              {quickNews.map(seg => <SegmentCard key={seg.id} segment={seg} />)}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
