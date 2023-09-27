const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const otpGenerator = require('otp-generator');
const bcrypt = require("bcrypt");
const jwt = require("jwtwebtoken");
require("dotenv").config();

// sendOtp --> for singup
// For sending otp we require 1) email to send 2) otp value the that generate in function itself

exports.sendOtp = async(request, respond) => {
    try{
        const {email} = request.body;
        // perform validation on email
        const existingUser = await User.findOne({email});
        console.log("Existing User is---->", existingUser);
        if(existingUser) {
            console.log("User Already exist in databse can't send otp again");
            return respond.status(401).json({
                sucess:false,
                data:existingUser,
                message:"User already exist in database invalid move Don't try to signup again",
            })
        }
        // generate otp using optGenerator instance
        let otp = otpGenerator.generate(6 , {upperCaseAlpabets:false,lowerCaseAlpabets:false, specialChars:false});
        console.log("Otp is----->", otp);
        // check unique otp or not
        const existingOtp = await OTP.findOne({otp});
        while(existingOtp) {
            otp = otpGenerator.generate(6 , {upperCaseAlpabets:false,lowerCaseAlpabets:false, specialChars:false});
        };
        // save otp in database
        const otpPayload =  ({email, otp:existingOtp});
        const otpBody = await OTP.create(otpPayload);    // is line s pehle otp wale schema code run ho jayga OTP pre Hook work before this line
        console.log("Otp body is ---> ", otpBody);
        // return success flag
        respond.status(200).json({
            sucess:true,
            data:otpBody,
            message:"Otp Send Successsfuly",
        })
    }
    catch(error){
        console.log(error);
        return respond.status(500).json({
            sucess:false,
            data:"Internal server error",
            message:"Something went wrong while sending otp form controllers",
            error:error.message,
        });
    }
}

/********************************************************************************************************************************/
// signup

exports.signUp = async(request, respond) => {
    try {
        // fetch data from request
        const {firstName, lastName, email , password, confirmPassword, accountType, contactNumber, otp} = request.body;
        // validate karlo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !contactNumber || !otp) {
            return respond.status(403).json({
                sucess:false,
                message:"All fields Are required",
            });
        }
        // 2 password match krlo
        if(password !== confirmPassword) {
            return respond.status(404).json({
                sucess:false,
                message:"Password and confirmPassword value doesn't match",
            });
        }
        // check user already exist or not
        let existingUser = await User.findOne({email});
        if(existingUser) {
            return respond.status(405).json({
                sucess:false, 
                message:"User already registered please check email id before try again",
            });
        }
        // find the most recent Otp stored for user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log("recenet otp--->", recentOtp);
        // validate otp
        if(recentOtp.length == 0) {
            return respond.status(406).json({
                sucess:false,
                message:"OTP not found",
            })
        }
        else if(otp !== recentOtp.otp){
            return respond.status(400).json({
                sucess:false,
                message:"Otp Is not matching",
            })
        }
        // hashpassowrd
        const hashpassowrd = await bcrypt.hash(password, 10);
        // This is fake profile ---> update while profile controller
        const profileDetails = await Profile.create({gender:null, dateOfBirth:null, about:null, contactNumber:null});
        // save entry in database
        const savedUser = await User.create({
            firstName, 
            lastName, 
            email, 
            password:hashpassowrd,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });
        // return success flag
        return respond.status(200).json({
            sucess:true,
            message:"User is registered succcessfully",
            data:savedUser,
        });
    }
    catch(error){
        console.log(error);
        return respond.status(500).json({
            sucess:false,
            data:"Internal server error",
            message:"User not be Registered, Please try agian",
            error:error.message,
        });
    }
}

/**************************************************************************************************** */
// login
exports.login = async(request, respond) => {
    try{
        // fetch email and password from request body
        const {email , password} = request.body;
        // validate entry empty or not ---> not valid return 
        if(!email || !password) {
            return respond.status(401).json({
                sucess:false,
                message:"All fields are required, please try again",
            });
        }
        // check for entry in database ---> not found return
        const existingUser = await User.findOne({email}).populate("additionalDetails").exec();
        // create a payload to send with jwt token
        const payload = {
            id:existingUser._id,
            email:existingUser.email,
            accountType:existingUser.accountType,
        }
        // comapre password with database entry 
        if(await bcrypt.compare(password, existingUser.password)){
            // geneate a jwt token
            const token = await jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:"2h"});
            // add token to current user
            existingUser.token = token;
            existingUser.password = undefined;
            // create option for cookie
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly:true,
            }
            // return cookie with response
            respond.cookie("token", token, options).status(200).json({
                success:true,
                data:existingUser,
                token,
                message:"User Logged in Successfully",
            });
        }
        else{
            return respond.status(419).json({
                success:false,
                message:"Password is incorrect",
            })
        }
    }
    catch(error){
        console.log(error);
        respond.status(405).json({
            sucess:false,
            data:"Internal server error Login Failure Please try again",
            message:error.message,
        });
    }
}

// // change Password
// exports.changePassword = async(request, respond){
//     try{
//         // get data from req body
//         // get oldPassword, newPassword, confirmNew Password
//         // perfrom validation

//         // update pw in database
//         // send mail ---> password updated successfully 
//         // return success flag
//     }
//     catch(error) {

//     }
// }