
import type * as parser from 'search-query-parser';

export function description(results: string|parser.SearchParserResult): any[] {
  const query = results as parser.SearchParserResult;

  const queries = [];

  if(query.description) {
    query.description.forEach(subQuery => {
      queries.push([
        {
          description: new RegExp(subQuery, 'i')
        }
      ]);
    });
  }

  if(query.exclude.description) {
    query.exclude.description.forEach(subQuery => {
      queries.push([
        {
          description: { $not: new RegExp(subQuery, 'i') }
        }
      ]);
    });
  }

  return queries.flat();
}