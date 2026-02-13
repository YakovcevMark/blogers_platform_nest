import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { IsUrl } from 'class-validator';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from '../../domain/blog.entity';

/**
 * @property {string} name - maxLength: 15.
 * @property {string} description - maxLength: 500.
 * @property {number} websiteUrl - maxLength: 100.
 */
export class CreateBlogInputDto {
  @IsStringWithTrim(nameConstraints.minLength, nameConstraints.maxLength)
  name: string;
  @IsStringWithTrim(
    descriptionConstraints.minLength,
    descriptionConstraints.maxLength,
  )
  description: string;
  @IsStringWithTrim(
    websiteUrlConstraints.minLength,
    websiteUrlConstraints.maxLength,
  )
  @IsUrl()
  websiteUrl: string;
}
