// This file consist of configuration for sending files to mail
const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSenderConnect = async(email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        });
        let info = transporter.sendMail({
            from:"Mail From StudyNotion",
            to:`${email}`,
            subject: `${title}`,
            body: `${body}`,
        })
        console.log("Mail send Info---->" , info);
        return info;
    }
    catch(error){
        console.log("Something went wrong while Connecting Nodemailer");
        console.log(error.message);
    }
}

module.exports = mailSenderConnect;

