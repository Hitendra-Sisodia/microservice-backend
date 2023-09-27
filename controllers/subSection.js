const subSection = require("../models/subSection");
const Section = require("../models/Section");
const uploadFileToCloudinary = require("../utils/imageUploader");

// create subSection
exports.createSubSection = async(request, respond) => {
    try{
        // extract details ie. courseId, sectionname
        const {sectionId, title, timeDuration, description} = request.body;
        // fetch video path
        const {video} = request.files.videoFile;
        // check validy of course id
        if(!sectionId || !title || !timeDuration || !description || !video) {
            return respond.status(401).json({
                success:false,
                message:"All Fields are required",
            });
        }
        // upload file to cloudinary
        const uploadedVideoUrl = await uploadFileToCloudinary(video, process.env.FOLDER_NAME);
        // save section in db
        const newSubSection = await Section.create({
            title,
            timeDuration,
            description,
            videoUrl:uploadedVideoUrl.secure_url,
        });
        // update referene in courses ie. courseContent
        const updatedSectionWithNewSubSection = await Course.findByIdAndUpdate({_id:sectionId}, {$push: {subSection:newSubSection._id}}, {new:true}).populate("subSection").exec();
        // return sucess flag
        return respond.status(200).json({
            success:true,
            data:newSubSection,
            message:"SubSection created successfully And Section Updated successfully",
        });
    }
    catch(error) {
        return respond.status(404).json({
            success:false,
            data:"Internal server error",
            message:"Failed To create Subsection",
        });
    }
}


/********************************************************************************************************************************************/


// extract details
// extract file path
// upload new file to cloudinary
// update entry in db
// send success flag

// update subSection
exports.subSection = async(request, respond) => {
    try{
        // extract details
        const {subSectionId, title, timeDuration, description} = request.body;
        // extract file path
        const {video} = request.files.videoFile;
        if(!title || !timeDuration || !description || !video) {
            return respond.status(401).json({
                success:false,
                message:"All Fields are required",
            });
        }
        // upload new file to cloudinary
        const uploadedVideoUrl = await uploadFileToCloudinary(video, process.env.FOLDER_NAME);
        // update entry in db
        const updatedSubSection = await subSection.findByIdAndUpdate({_id:subSectionId}, 
            {
                title:title,
                timeDuration:timeDuration,
                description:description,
                videoUrl:uploadedVideoUrl,
            });
        // send success flag
        return respond.status(200).json({
            success:true,
            data:updatedSubSection,
            message:"SubSection Updated successfully",            
        });
    }
    catch(error) {
        return respond.status(404).json({
            success:false,
            data:"Internal server error",
            message:"Failed To Update Subsection",
        });
    }
}


/********************************************************************************************************************************************/


// fetch subsection id
// check validity
// delete entry in db
// TODO: do we need to delete the entry from the section schema --> self TODO
// delete subSection
// send sucess flag


exports.deleteSubSection = async(request, respond) => {
    try{
        // fetch subsection id
        const {subSectionId} = request.body; 
        // check validity
        if(!subSectionId) {
            return respond.status(401).json({
                success:false,
                message:"All Fields are required",
            });
        }
        // delete entry in db
        const deletedSubSection = await subSection.findByIdAndDelete({_id:subSectionId});
        // TODO: do we need to delete the entry from the section schema --> self TODO
        // send sucess flag
        return respond.status(200).json({
            success:true,
            data:deletedSubSection,
            message:"SubSection Deleted successfully",            
        })
    }
    catch(error) {
        return respond.status(404).json({
            success:false,
            data:"Internal server error",
            message:"Failed To Delete Subsection",
        });
    }
}