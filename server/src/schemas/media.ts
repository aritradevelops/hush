import { ToInt } from "class-sanitizer"
import { IsNumberString, IsString } from "class-validator-custom-errors"
import { UUID } from "crypto"


export class PartUpload {
  @IsString()
  path!: string
  @IsString()
  multipart_id!: string
  @IsNumberString()
  @ToInt()
  part_number!: number
}

export class MultipartEnd {
  @IsString()
  id!: UUID
  @IsString()
  path!: string
  @IsString()
  multipart_id!: string
}