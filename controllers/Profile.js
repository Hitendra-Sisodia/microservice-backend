const Profile = require("../models/Profile");
const User = require("../models/Profile");

// update profile
exports.updateProfile = async(request, respond) => {
    try{
        // extract profile details + userId
        const {dateOfBirth="", about="", contactNumber, gender} = request.body;
        const userId = request.user.id;
        // perform validation
        if(!contactNumber || !gender || !userId) {
            return respond.status(401).json({
                success:false,
                message:"All Fields are required",
            });
        }
        // find User Details => find Profile Id => find profil details
        const UserDetails = await User.findById({_id:userId});
        const profileId = UserDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        // update Profile Using 2nd Method to save entry in db
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        // send success flag
        return respond.status(200).json({
            success:true,
            message:"Profile Update Successfully",
            data:profileDetails,
        });
    }
    catch(error) {
        respond.status(403).json({
            success:false,
            data:"Internal Server Error",
            message:"Profile Updation Failed",
            error:error.message,
        });
    }
}


/********************************************************************************************************************************************/

// delete Account

exports.deleteAccount = async(request, respond) => {
    try{
        // get id
        const {userId} = request.user.id;
        // validation
        const userDetails = await findById({userId});
        if(!userId) {
            return respond.status(401).json({
                success:false,
                message:"All Fields are required",
            });
        }
        // delete profile [Additonal Profile]
        await findByIdAndDelete({_id:userDetails.additionalDetails});
        // TODO: Unernroll user from all enrolled courses
        // delete user
        await User.findByIdAndDelete({_id:userId});
        return respond.status(200).json({
            success:true,
            message:"Account Delete Successfully",
        });
    }
    catch(error) {
        respond.status(403).json({
            success:false,
            data:"Internal Server Error",
            message:"Account is not deleted",
            error:error.message,
        });
    }
}

/********************************************************************************************************************************************/

// get all User details

exports.getAllUserDetails = async (request, respond) => {
    try{
        // fetch user id
        const userId = request.user.id;
        // perform validation   // get all details
        const userDetails = await User.findById({_id:userId}).populate("additionalDetails").exec();
        // return success flag
        return respond.status(200).json({
            success:true,
            message:"Account Deleted Successfully",
        });
    }
    catch(error) {
        respond.status(403).json({
            success:false,
            data:"Internal Server Error",
            message:"Failed to Get User Details",
            error:error.message,
        });
    }
}