import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const q = url.searchParams.get('q');

    if (!q) return new Response('Invalid query', { status: 400 });

    try {
        const cacheKey = `subreddit_search:${q.toLowerCase()}`;
        const cachedResults: string | null = await redis.get(cacheKey);

        if (cachedResults) {
            console.log("Redis Cache Hit! - Query:", q);
            return new Response(String(cachedResults)); // Explicitly convert to String here
        }

        const results = await db.subreddit.findMany({
            where: {
                name: {
                    startsWith: q,
                },
            },
            include: {
                _count: true,
            },
            take: 5,
        });

        const jsonResults = JSON.stringify(results);
        await redis.set(cacheKey, jsonResults, { ex: 60 });
        console.log("Redis Cache Miss - Populating Cache - Query:", q, "Results:", results);
        return new Response(jsonResults, {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("API Search Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}