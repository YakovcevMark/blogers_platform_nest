import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../domain/post.entity';
import { IsMongoId } from 'class-validator';

/**
 * @property {string} title - maxLength: 30.
 * @property {string} shortDescription - maxLength: 100.
 * @property {number} content - maxLength: 1000.
 * @property {number} blogId - blog with that id should exist.
 */
export class CreatePostInputDto {
  @IsStringWithTrim(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;
  @IsStringWithTrim(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;
  @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;
  @IsMongoId()
  blogId: string;
}
