import mongoose, { Document, Schema } from "mongoose";

export interface IWebhookEvent extends Document {
    eventId: string;
    eventType: string;
    processedAt: Date;
}

const WebhookEventSchema  = new Schema<IWebhookEvent>({
    eventId: {
        type: String,
        required: true,
        unique: true
    },
    eventType: {
        type: String,
        required: true
    },
    processedAt: { type: Date, default: Date.now },
},
 { timestamps: { createdAt: "processedAt", updatedAt: false } }
)

const WebhookEvent = mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);

export default WebhookEvent;