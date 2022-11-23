
import type * as parser from 'search-query-parser';

export function bare(results: string|parser.SearchParserResult): any {
  const query = results as string;

  return {
    $or: [
      {
        name: new RegExp(query, 'i')
      },
      {
        description: new RegExp(query, 'i')
      },
      {
        cardNames: new RegExp(query, 'i')
      },
      {
        expansions: new RegExp(query, 'i')
      }
    ]
  };
}