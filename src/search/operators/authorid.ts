
import type * as parser from 'search-query-parser';

export function authorid(results: string|parser.SearchParserResult): any[] {
  const query = results as parser.SearchParserResult;

  const queries = [];

  if(query.authorid) {
    query.authorid.forEach(subQuery => {
      queries.push([
        {
          authorId: subQuery
        }
      ]);
    });
  }

  if(query.exclude.authorid) {
    query.exclude.authorid.forEach(subQuery => {
      queries.push([
        {
          authorId: { $ne: subQuery }
        }
      ]);
    });
  }

  return queries.flat();
}