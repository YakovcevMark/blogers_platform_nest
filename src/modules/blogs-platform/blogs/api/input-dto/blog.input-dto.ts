import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

/**
 * @property {string} name - maxLength: 15.
 * @property {string} description - maxLength: 500.
 * @property {number} websiteUrl - maxLength: 100.
 */
export class CreateBlogInputDto {
  @IsStringWithTrim(1, 15)
  name: string;
  @IsStringWithTrim(1, 500)
  description: string;
  @IsStringWithTrim(1, 100)
  websiteUrl: string;
}
