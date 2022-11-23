
import type * as parser from 'search-query-parser';

export function expansion(results: string|parser.SearchParserResult): any[] {
  const query = results as parser.SearchParserResult;

  const queries = [];

  if(query.expansion) {
    query.expansion.forEach(subQuery => {
      queries.push([
        {
          expansions: new RegExp(subQuery, 'i')
        }
      ]);
    });
  }

  if(query.exclude.expansion) {
    query.exclude.expansion.forEach(subQuery => {
      queries.push([
        {
          expansions: { $not: new RegExp(subQuery, 'i') }
        }
      ]);
    });
  }

  return queries.flat();
}