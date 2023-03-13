import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional } from "class-validator";
import { QueryParams } from "../dto/query-params.dto";

export class ChronoQueryParams extends QueryParams {
    @ApiProperty()
    @IsOptional()
    @IsNumberString()
    from?: string;
  
    @ApiProperty()
    @IsOptional()
    @IsNumberString()
    to?: string;
}