import { LikeStatus } from '../enums/like-status';
import { Prop } from '@nestjs/mongoose';

export class Like {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, enum: LikeStatus, required: true })
  status: LikeStatus;

  changeLikeStatus(newStatus: LikeStatus) {
    this.status = newStatus;
  }
}
