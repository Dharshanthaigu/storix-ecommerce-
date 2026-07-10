import  Queue  from "bull";
import { resolve } from "node:dns";


export const orderQueue = new Queue("order-notifications",{

    redis:{
        host:"127.0.0.1",
        port: 6379,
    },
});

orderQueue.process(async (job)=>{
    const {orderId, email , phone} = job.data

    // Simulate sending email/SMS — replace with real provider later (e.g., Nodemailer, Twilio)
    console.log(`[Queue] Sending confirmation for order ${orderId} to ${email}, ${phone}`)

    // Simulate network delay of a real email/SMS provider
    await new Promise((resolve) => setTimeout(resolve,2000))
    
    console.log(`[Queue] Confirmation sent for order ${orderId}`)
})