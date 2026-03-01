import { IsEnum } from 'class-validator';
export enum ShortLinkPreference { DUB = 'DUB', SHORTIO = 'SHORTIO', KUTT = 'KUTT', LINKDRIP = 'LINKDRIP' }

export class ShortlinkPreferenceDto {
  @IsEnum(ShortLinkPreference)
  shortlink: ShortLinkPreference;
}

