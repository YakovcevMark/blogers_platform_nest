/**
 * @property {string} title - maxLength: 30.
 * @property {string} shortDescription - maxLength: 100.
 * @property {number} content - maxLength: 1000.
 */
export class CreateBlogPostInputDto {
  title: string;
  shortDescription: string;
  content: string;
}
