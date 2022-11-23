import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import { isString, isArray } from 'lodash';
import * as parser from 'search-query-parser';

import { Deck } from '../deck/deck.schema';
import { bare } from './operators';
import { name } from './operators/name';
import { authorid } from './operators/authorid';
import { card } from './operators/card';
import { description } from './operators/description';
import { expansion } from './operators/expansion';
import { User } from '../user/user.schema';
import { UserService } from '../user/user.service';

const pageSize = 20;

const operators = [
  authorid,
  card,
  description,
  expansion,
  name
];

const coerces = {
  authorid: ['aid'],
  card: ['c'],
  description: ['d'],
  expansion: ['e'],
  name: ['n']
};

@Injectable()
export class SearchService {

  private get allAliases(): string[] {
    return Object.keys(coerces).map(key => [key, ...coerces[key]]).flat();
  }

  constructor(
    @InjectRepository(Deck)
    private readonly deckRepository: EntityRepository<Deck>,

    private readonly userService: UserService
  ) {}

  public async assignAuthorsToDecks(decks: Deck[]): Promise<Deck[]> {

    const decksWithAuthors: Deck[] = await Promise.all(decks.map(async deck => {

      const author = await this.userService.findById(deck.authorId.toString());
      if(!author) return { ...deck, id: deck.id.toString(), author: null };

      return { 
        ...deck, 
        id: deck._id.toString(), 
        author: { displayName: author.displayName, id: author.id, firebaseUId: author.firebaseUId, emailHash: author.emailHash } as User 
      };
    }));

    return decksWithAuthors;

  }

  public async search(query: string, page = 0, sortKey = '', sortBy = 'asc', searchAuthor = ''): Promise<{ decks: Deck[], pagination: { page: number, pageSize: number, totalPages: number, totalResults: number } }> {
    query = query.split('is:deck').join('').trim();

    const result = parser.parse(query, { keywords: this.allAliases, offsets: false });

    const basePaging: any = { limit: pageSize, offset: page * pageSize };
    if(sortKey) {
      basePaging.orderBy = { [sortKey]: sortBy === 'asc' ? 1 : -1 };
    }
  
    // the parser returns a string if there's nothing interesting to do, for some reason
    // so we have a bare words parser
    if(isString(result)) {
      const mongoQuery = bare(result);
      const decks = await this.deckRepository.find(mongoQuery, basePaging);
      const totalResults = await this.deckRepository.count(mongoQuery);
      const withAuthors = await this.assignAuthorsToDecks(decks);

      return { decks: withAuthors, pagination: { page, pageSize, totalPages: Math.ceil(totalResults / pageSize), totalResults } };
    }

    const searchResult: parser.SearchParserResult = result as parser.SearchParserResult;

    // coerce the keys onto one key
    Object.keys(coerces).forEach(mainAlias => {
      const otherAliases = coerces[mainAlias];

      let adds = [];
      let removes = [];

      // figure out what we should add/remove for other aliases
      otherAliases.forEach(alias => {
        if(searchResult[alias]) {
          adds.push(searchResult[alias]);
          delete searchResult[alias];
        }

        if(searchResult.exclude[alias]) {
          removes.push(searchResult.exclude[alias]);
          delete searchResult.exclude[alias];
        }
      });

      adds = adds.flat();
      removes = removes.flat();

      if(adds.length > 0) {
        // if it doesn't exist but we have things to put in it, do that
        if(!searchResult[mainAlias]) searchResult[mainAlias] = [];

        // if it's not an array (and did exist), make it an array
        if(!isArray(searchResult[mainAlias])) searchResult[mainAlias] = [searchResult[mainAlias]];

        // add the new things
        searchResult[mainAlias].push(...adds);
      }

      if(removes.length > 0) {
        // if it doesn't exist but we have things to put in it, do that
        if(!searchResult.exclude[mainAlias]) searchResult.exclude[mainAlias] = [];

        // if it's not an array (and did exist), make it an array
        if(!isArray(searchResult.exclude[mainAlias])) searchResult.exclude[mainAlias] = [searchResult.exclude[mainAlias]];

        // add the new things
        searchResult.exclude[mainAlias].push(...removes);
      }
    });

    // make things an array if they're not
    Object.keys(searchResult).forEach(key => {
      if(key === 'exclude') return;
      if(!isArray(searchResult[key])) searchResult[key] = [searchResult[key]];
    });

    Object.keys(searchResult.exclude).forEach(key => {
      if(!isArray(searchResult.exclude[key])) searchResult.exclude[key] = [searchResult.exclude[key]];
    });

    const baseQuery = { 
      isPrivate: false, 
      isDeleted: false, 
      $or: [] 
    };

    // get the query operators
    operators.forEach(op => {
      const queries = op(searchResult);
      baseQuery.$or.push(...queries);
    });

    if(baseQuery.$or.length === 0) return { decks: [], pagination: { page: 0, pageSize: 0, totalPages: 0, totalResults: 0 } };

    const baseResults = await this.deckRepository.find(baseQuery, basePaging);
    const totalResults = await this.deckRepository.count(baseQuery);

    const decksWithAuthors = await this.assignAuthorsToDecks(baseResults);

    return { 
      decks: decksWithAuthors, 
      pagination: { page, pageSize, totalPages: Math.ceil(totalResults / pageSize), totalResults } 
    };
  }

}
