import { Schema, model, models } from 'mongoose';

const verificationTokenSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['verification', 'reset'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Token expires after 10 minutes
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

export const VerificationToken = models.VerificationToken || model('VerificationToken', verificationTokenSchema);
