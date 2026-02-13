import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { contentConstraints } from '../../domain/comment.entity';

/**
 * @property {string} content - maxLength: 300
 * minLength: 20
 */
export class UpdateCommentDto {
  @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;
}
