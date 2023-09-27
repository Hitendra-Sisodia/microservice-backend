// setup for sending mails 
const mongoose = require("mongoose");
const mailSenderConnect = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp:{
        type:String,
        required: true,
    },
    createdAt:{
        type:Date,
        required: Date.now(),
        expires: 5 * 60,
    }
});


// a function --> used to send emails [configuration setup found in utils -> mailSender.js]
async function sendVerificationEmail(email , otp) {
    try{                                            // sender email   // subject    // otp (body)
        const mailResponse = await mailSenderConnect(email, "Verification Email from StudyNotion" , otp);
        console.log("Email Send Successfully");
    }
    catch(error) {
        console.log("Error occured while sending mail" , error);
        throw error;
    }
}

/******************************************************************************************************************* */

// "save": This middleware function is triggered before saving a document 
// of the specified schema to the database. 
// It's a common practice to execute certain tasks before saving data, such as validation,
//  data manipulation, or, in this case, sending a verification email.
// using pre hook for sending mail

/******************************************************************************************************************* */
// --> passing next in this function causes execution remaning pre functions one after another
OTPSchema.pre("save" , async function(next)  {   // This function will execute before controllers -> auth -> createOtp -> otp.create()
    await sendVerificationEmail(this.email, this.otp); // fetching data from Upper schema
    console.log("This is next agrument ---> ", next);
    console.log("this.email --->",email );
    next();
})


module.exports = mongoose.model("OTP" , OTPSchema);