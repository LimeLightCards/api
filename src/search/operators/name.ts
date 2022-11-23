
import type * as parser from 'search-query-parser';

export function name(results: string|parser.SearchParserResult): any[] {
  const query = results as parser.SearchParserResult;

  const queries = [];

  if(query.name) {
    query.name.forEach(subQuery => {
      queries.push([
        {
          name: new RegExp(subQuery, 'i')
        }
      ]);
    });
  }

  if(query.exclude.name) {
    query.exclude.name.forEach(subQuery => {
      queries.push([
        {
          name: { $not: new RegExp(subQuery, 'i') }
        }
      ]);
    });
  }

  return queries.flat();
}