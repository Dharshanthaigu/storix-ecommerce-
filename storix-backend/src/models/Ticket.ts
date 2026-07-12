import mongoose, { Document, Schema } from "mongoose";

export interface ITicket extends Document {
    user: mongoose.Types.ObjectId;
    subject: string;
    message: string;
    status: "open" | "in_progress" | "resolved";
    createAt: Date;
}


const TicketSchema =  new Schema<ITicket>({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    subject:{
        type:String,
        required: true,
        trim: true
    },
    message:{
        type:String,
        required: true,
        trim: true
    },
    status:{
        type:String,
        enum: ["open", "in_progress" , "resolved"],
        default: "open"
    },
},
{timestamps: true}
)

const Ticket =  mongoose.model<ITicket>("Ticket",TicketSchema)

export default Ticket