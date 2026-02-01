import { NextResponse } from 'next/server';
import { fetchNewNewsletter, saveNewsletter } from '@/lib/rss';
import { parseNewsletterSegments } from '@/lib/parser';

export async function GET() {
  try {
    const newsletter = await fetchNewNewsletter();

    if (!newsletter) {
      return NextResponse.json({ message: 'No new newsletter' });
    }

    const newsletterId = await saveNewsletter(newsletter);
    await parseNewsletterSegments(newsletterId, newsletter.content);

    return NextResponse.json({
      message: 'Newsletter processed',
      newsletterId
    });
  } catch (error) {
    console.error('Cron fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
