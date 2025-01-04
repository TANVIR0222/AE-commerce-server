import ApiError from "./ApiError.js";
import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_RESEND);

 
const sendEmail = async ({sendTo , subject , html})  => {
    try {
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: sendTo,
            subject: subject,
            html:html ,
        });
    
        if (error) {
            console.log(error)
        }
        
        return data;
    } catch (error) {
      throw new ApiError(500 , error?.message || "send email falid " )  
    }
}

export default sendEmail;  // export the function to be used elsewhere