import { ArrayMinSize, IsArray, IsNumber, IsObject, IsOptional, IsString, isUUID, ValidateNested, validateSync } from "class-validator-custom-errors";
import { SchemaValidationError } from "../errors/http/schema-validation.error";
import { plainToInstance, Type } from "class-transformer";


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
  | ContainsClauseInterface
  | ContainedByClauseInterface
  | OverlapsClauseInterface;

export interface ClauseMap {
  [column: string]: UnknownClauseInterface;
}

export abstract class Clause {
  abstract toSql(column: string): string;

  validate() {
    const errors = validateSync(this);
    if (errors.length) throw new SchemaValidationError(errors);
  }
  static build(clause: UnknownClauseInterface): Clause {
    switch (Object.keys(clause)[0]) {
      case "$in":
        return plainToInstance(InClause, clause);
      case "$eq":
        return plainToInstance(EqualsClause, clause);
      case "$isNull":
        return plainToInstance(IsNullClause, clause);
      case "$gt":
        return plainToInstance(GreaterThanClause, clause);
      case "$gte":
        return plainToInstance(GreaterThanOrEqualClause, clause);
      case "$lt":
        return plainToInstance(LessThanClause, clause);
      case "$lte":
        return plainToInstance(LessThanOrEqualClause, clause);
      case "$any":
        return plainToInstance(AnyClause, clause);
      case "$between":
        return plainToInstance(BetweenClause, clause);
      case "$and":
        return plainToInstance(AndClause, clause);
      case "$or":
        return plainToInstance(OrClause, clause);
      case "$not":
        return plainToInstance(NotClause, clause);
      case "$notEquals":
        return plainToInstance(NotEqualsClause, clause);
      case "$contains":
        return plainToInstance(ContainsClause, clause);
      case "$containedBy":
        return plainToInstance(ContainedByClause, clause);
      case "$overlaps":
        return plainToInstance(OverlapsClause, clause);
      default:
        throw new Error(`Invalid clause type: ${Object.keys(clause)[0]}`);
    }
  }
}

// **$in Clause**
export class InClause extends Clause implements InClauseInterface {
  @IsArray()
  @ArrayMinSize(1)
  $in!: (string | number)[];

  toSql(column: string): string {
    return `${column} IN (${this.$in.map(v => (typeof v === "number" ? v : `'${v}'`)).join(", ")})`;
  }
}

// **$eq Clause**
export class EqualsClause extends Clause implements EqualsClauseInterface {
  $eq!: string | number;

  toSql(column: string): string {
    return `${column} = ${typeof this.$eq === "number" ? this.$eq : `'${this.$eq}'`}`;
  }
}
// **$neq Clause**
export class NotEqualsClause extends Clause implements NotEqualsClauseInterface {
  $neq!: string | number;

  toSql(column: string): string {
    return `${column} != ${typeof this.$neq === "number" ? this.$neq : `'${this.$neq}'`}`;
  }
}

// **$eq null Clause (IsNull)**
export class IsNullClause extends Clause implements IsNullClauseInterface {
  @IsOptional()
  $isNull!: null;

  toSql(column: string): string {
    return `${column} IS NULL`;
  }
}

// **$gt Clause**
export class GreaterThanClause extends Clause implements GreaterThanClauseInterface {
  @IsNumber()
  $gt!: number;

  toSql(column: string): string {
    return `${column} > ${this.$gt}`;
  }
}

// **$gte Clause**
export class GreaterThanOrEqualClause extends Clause implements GreaterThanOrEqualClause {
  @IsNumber()
  $gte!: number;

  toSql(column: string): string {
    return `${column} >= ${this.$gte}`;
  }
}

// **$lt Clause**
export class LessThanClause extends Clause implements LessThanClauseInterface {
  @IsNumber()
  $lt!: number;

  toSql(column: string): string {
    return `${column} < ${this.$lt}`;
  }
}

// **$lte Clause**
export class LessThanOrEqualClause extends Clause implements LessThanOrEqualClauseInterface {
  @IsNumber()
  $lte!: number;

  toSql(column: string): string {
    return `${column} <= ${this.$lte}`;
  }
}

// **$any Clause**
export class AnyClause extends Clause implements AnyClauseInterface {
  @IsArray()
  @ArrayMinSize(1)
  $any!: (string | number)[];

  toSql(column: string): string {
    return `${column} = ANY(ARRAY[${this.$any.map(v => `'${v}'`).join(", ")}])`;
  }
}

// **$between Clause**
export class BetweenClause extends Clause implements BetweenClauseInterface {
  @IsArray()
  @ArrayMinSize(2)
  $between!: [number, number];

  toSql(column: string): string {
    return `${column} BETWEEN ${this.$between[0]} AND ${this.$between[1]}`;
  }
}

// **$and Clause**
export class AndClause extends Clause implements AndClauseInterface {
  @IsArray()
  @ValidateNested({ each: true })
  $and!: UnknownClauseInterface[];

  toSql(column: string): string {
    const clauses = this.$and.map(c => Clause.build(c));
    for (const c of clauses) {
      c.validate();
    }
    return `(${clauses.map(c => c.toSql(column)).join(" AND ")})`;
  }
}

// **$or Clause**
export class OrClause extends Clause implements OrClauseInterface {
  @IsArray()
  @ValidateNested({ each: true })
  $or!: UnknownClauseInterface[];

  toSql(column: string): string {
    const clauses = this.$or.map(c => Clause.build(c));
    for (const c of clauses) {
      c.validate();
    }
    return `(${clauses.map(c => c.toSql(column)).join(" OR ")})`;
  }
}

// **$not Clause**
export class NotClause extends Clause implements NotClauseInterface {
  @IsObject()
  $not!: UnknownClauseInterface;

  toSql(column: string): string {
    const clause = Clause.build(this.$not)
    console.log(clause)
    clause.validate();
    return `NOT (${clause.toSql(column)})`;
  }
}

// **$contains Clause**
export class ContainsClause extends Clause implements ContainsClauseInterface {
  @IsArray()
  @ArrayMinSize(1)
  $contains!: (string | number)[];

  toSql(column: string): string {
    let query = `${column} @> ARRAY[${this.$contains.map(v => `'${v}'`).join(", ")}]`;
    if (isUUID(this.$contains[0])) {
      query += '::uuid[]';
    }
    return query;
  }
}

// **$containedBy Clause**
export class ContainedByClause extends Clause {
  @IsArray()
  @ArrayMinSize(1)
  $containedBy!: (string | number)[];

  toSql(column: string): string {
    return `${column} <@ ARRAY[${this.$containedBy.map(v => `'${v}'`).join(", ")}]`;
  }
}

// **$overlaps Clause**
export class OverlapsClause extends Clause {
  @IsArray()
  @ArrayMinSize(1)
  $overlaps!: (string | number)[];

  toSql(column: string): string {
    return `${column} && ARRAY[${this.$overlaps.map(v => `'${v}'`).join(", ")}]`;
  }
}
