// how password is reset 
// 1) Generate Ui link
// 1) send mail with ui 
// 2) --> redirect to reset password page 
// 3) ---> send otp 
// 4)--> choose new password 
// 5) ---> back to login page


const User = require("../models/User");
const mailSenderConnect = require("../utils/mailSender");
const bcryt = require("bcrypt");


// reset password token ---> generate token and make entry in user model
exports.resetPasswordToken = async(request, respond) => {
    try{
        // reset email form request body
        const {email} = request.body;
        // perfrom some  kinds of validantion
        if(!email) {
            return respond.status(401).json({
                success:false,
                message:"Email id can't be empty of resetting password",
            })
        }
        // check user exist in databse
        const existingUser = await User.findOne({email});
        if(!existingUser) {
            return respond.status(400).json({
                success:false,
                message:"User Not exist please SigUp first then try to reset password",
            });
        }
        // generate token
        const token = crypto.randomUUID();
        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email}, {token:token, resetPasswordExpires: Date.now() + 5 * 60 * 1000, }, {new:true});
        // create url
        const url = `https://localhost:3000/update-password/${token}`
        // send mail with  containing url
        await mailSenderConnect(email, "Password Reset Link", `Passowrd Reset link: ${url} This Email is Only Valid For 5 minutes`);
        // return response
        return respond.json({
            success:true,
            data:updatedDetails,
            message:"Email Sent Successfully, please check email and change password carefully :)",
        });
    }
    catch(error) {
        return respond.status(600).json({
            success:false,
            message:"Internal server error Something went wrong during password rest",
            error:error.message,
        });
    }
}



/************************************************************************************************************************* */
// reset password
exports.resetPassword = async(request, respond) => {
    try{
        // data fetch ---> token exist in body ---> from frontend part
        const {password, confirmPassord, token} = request.body;
        // validation
        if(!password != confirmPassord){
            return respond.status(302).json({
                success:false,
                message:"Password doesn't match",
            });
        }
        // get userdetails from db using token
        const existingUser = await User.findOne({token:token});
        // if no entry ->> invalid token
        if(!existingUser){
            return respond.status(303).json({
                success:false,
                message:"Invalid Token",
            });
        }
        // token time
        if(existingUser.resetPasswordExpires < Date.now()) {
            return respond.status(304).json({
                success:false,
                message:"Token Time expires please try again for resetting passowrd",
            });
        }
        // hashpassowrd
        let hashpassowrd;
        try{
            hashpassowrd = await bcryt.hash(password, 10);
        }
        catch(error) {
            return respond.status(305).json({
                success:false,
                message:"Error occured while hashing password for resetting password",
            });
        }
        // update password in db
        const updatedUserPasswordEntry = await User.findOneAndUpdate({token:token}, {password:hashpassowrd}, {new:true});
        // return success flag
        return respond.status(200).json({
            success:true,
            message:"Passowrd Reset successfukky",
            resetToken:token,
            data:updatedUserPasswordEntry,
        })
    }
    catch(error) {
        return respond.status(600).json({
            success:false,
            message:"Internal server error Something went wrong during password rest",
            error:error.message,
        });
    }
}