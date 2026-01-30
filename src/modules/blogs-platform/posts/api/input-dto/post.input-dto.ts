/**
 * @property {string} title - maxLength: 30.
 * @property {string} shortDescription - maxLength: 100.
 * @property {number} content - maxLength: 1000.
 * @property {number} blogId - blog with that id should exist.
 */
export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
