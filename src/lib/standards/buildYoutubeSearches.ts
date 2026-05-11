import type { StandardDefinition } from '@/types/assessment';

function toYoutubeSearchUrl(query: string) {
  const encoded = encodeURIComponent(query);
  return `https://www.youtube.com/results?search_query=${encoded}`;
}

export function buildYoutubeSearches(standard: StandardDefinition) {
  const baseQuery = `${standard.id} Florida grade 4 math`;
  const studentQuery = `${standard.summary} grade 4 math lesson`;

  return [
    {
      id: `${standard.id}-code`,
      label: 'Search by benchmark code',
      href: toYoutubeSearchUrl(baseQuery),
    },
    {
      id: `${standard.id}-concept`,
      label: 'Search by skill',
      href: toYoutubeSearchUrl(studentQuery),
    },
  ];
}
