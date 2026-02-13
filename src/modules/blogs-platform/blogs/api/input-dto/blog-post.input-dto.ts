import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../../posts/domain/post.entity';

/**
 * @property {string} title - maxLength: 30.
 * @property {string} shortDescription - maxLength: 100.
 * @property {number} content - maxLength: 1000.
 */
export class CreateBlogPostInputDto {
  @IsStringWithTrim(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;
  @IsStringWithTrim(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;
  @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;
}
