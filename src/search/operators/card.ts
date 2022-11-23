
import type * as parser from 'search-query-parser';

export function card(results: string|parser.SearchParserResult): any[] {
  const query = results as parser.SearchParserResult;

  const queries = [];

  if(query.card) {
    query.card.forEach(subQuery => {
      queries.push([
        {
          [`cards.${subQuery}`]: { $gt: 0 }
        },
        {
          cardNames: new RegExp(subQuery, 'i')
        }
      ]);
    });
  }

  if(query.exclude.card) {
    query.exclude.card.forEach(subQuery => {
      queries.push([
        {
          [`cards.${subQuery}`]: { $lte: 0 }
        },
        {
          cardNames: { $not: new RegExp(subQuery, 'i') }
        }
      ]);
    });
  }

  return queries.flat();
}