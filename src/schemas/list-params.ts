import { ToBoolean, ToInt, Trim } from "class-sanitizer";
import { IsIn, IsNumberString, IsObject, IsOptional, IsString } from "class-validator-custom-errors";

export class ListParams {
  @IsString()
  @IsOptional()
  @Trim()
  search = '';
  @IsString()
  @IsOptional()
  @Trim()
  order_by = 'created_at';
  @IsString()
  @IsOptional()
  @Trim()
  @IsIn(['DESC', 'ASC'])
  order: 'DESC' | 'ASC' = 'DESC';
  @IsNumberString()
  @ToInt()
  @IsOptional()
  page = 1;
  @IsNumberString()
  @ToInt()
  @IsOptional()
  per_page = 10;
  @IsOptional()
  @ToBoolean(true)
  trash: boolean = false;
  @IsOptional()
  @IsObject()
  where_clause: Record<string, unknown> = {};
  @IsOptional()
  @IsString()
  select = '';
}