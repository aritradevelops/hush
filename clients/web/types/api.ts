
export interface ApiListResponseSuccess<T> {
  message: string;
  data: T[];
}

export interface ApiListResponseError<T> {
  message: string;
  errors: {
    field: keyof T;
    message: string;
  }[];
}

export type ApiListResponse<T> = ApiListResponseSuccess<T> | ApiListResponseError<T>;

export type OrderDirection = 'DESC' | 'ASC';

export interface ListParams {
  search?: string;
  order_by?: string;
  order?: OrderDirection;
  page?: number;
  per_page?: number;
  trash?: boolean;
  where_clause?: ClauseMap;
  select?: string;
}

export interface InClauseInterface {
  $in: (string | number)[];
}

export interface EqualsClauseInterface {
  $eq: string | number;
}

export interface IsNullClauseInterface {
  $isNull: null;
}

export interface GreaterThanClauseInterface {
  $gt: number;
}

export interface GreaterThanOrEqualClauseInterface {
  $gte: number;
}

export interface LessThanClauseInterface {
  $lt: number;
}

export interface LessThanOrEqualClauseInterface {
  $lte: number;
}

export interface AnyClauseInterface {
  $any: (string | number)[];
}

export interface BetweenClauseInterface {
  $between: [number, number];
}

export interface AndClauseInterface {
  $and: UnknownClauseInterface[];
}

export interface OrClauseInterface {
  $or: UnknownClauseInterface[];
}


export interface NotClauseInterface {
  $not: UnknownClauseInterface;
}

export interface NotEqualsClauseInterface {
  $neq: string | number;
}

export interface ContainsClauseInterface {
  $contains: (string | number)[];
}

export interface ContainedByClauseInterface {
  $containedBy: (string | number)[];
}

export interface OverlapsClauseInterface {
  $overlaps: (string | number)[];
}

export type UnknownClauseInterface =
  | InClauseInterface
  | EqualsClauseInterface
  | NotEqualsClauseInterface
  | IsNullClauseInterface
  | GreaterThanClauseInterface
  | GreaterThanOrEqualClauseInterface
  | LessThanClauseInterface
  | LessThanOrEqualClauseInterface
  | AnyClauseInterface
  | BetweenClauseInterface
  | AndClauseInterface
  | OrClauseInterface
  | NotClauseInterface
  | ContainedByClauseInterface
  | OverlapsClauseInterface;

export interface ClauseMap {
  [column: string]: UnknownClauseInterface;
}