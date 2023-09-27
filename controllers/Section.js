const Course = require("../models/Course");
const Section = require("../models/Section");


// create section
exports.createSection = async(request, respond) => {
    try{
        // extract details ie. courseId, sectionname
        const {courseId, sectionName} = request.body;
        // check validy of course id
        if(!courseId || !sectionName) {
            return respond.status(401).json({
                success:false,
                message:"All Fields are required",
            });
        }
        // save section in db
        const newSection = await Section.create({sectionName:sectionName});
        // update referene in courses ie. courseContent
        const updatedCourseWithNewSection = await Course.findByIdAndUpdate({_id:courseId}, {$push: {courseContent:newSection._id}}, {new:true}).populate("courseContent").exec();
        // return sucess flag
        return respond.status(200).json({
            success:true,
            data:newSection,
            message:"Section created successfully And Course Updated successfully",
        });
    }
    catch(error) {
        return respond.status(404).json({
            success:false,
            data:"Internal server error",
            message:"Failed To create section",
        });
    }
}

// data input
// update data
// return respond



// update section
exports.updateSection = async(request, respond) => {
    try{
        // extract details ie. courseId, sectionname
        const {sectionId, sectionName} = request.body;
        // check validy of course id
        if(!sectionName) {
            return respond.status(401).json({
                success:false,
                message:"All Fields are required",
            });
        }
        // save section in db
        const updateSection = await Section.findByIdAndUpdate({_id:sectionId},{sectionName:sectionName});
        // return sucess flag
        return respond.status(200).json({
            success:true,
            message:"SectionName Updated successfully",
        });
    }
    catch(error) {
        return respond.status(404).json({
            success:false,
            data:"Internal server error",
            message:"Failed To Update section",
        });
    }
}

// delete section
exports.deleteSection = async(request, respond) => {
    try{
        // extract details 
        const {sectionId} = request.body;
        // check validy of course id
        if(!sectionId) {
            return respond.status(401).json({
                success:false,
                message:"All Fields are required",
            });
        }
        // delete section in db
        const deletedSection = await Section.findByIdAndDelete({_id:sectionId});
        // TODO: do we need to delete the entry from the course schema
        // return sucess flag
        return respond.status(200).json({
            success:true,
            message:"Section Deleted successfully",
        });
    }
    catch(error) {
        return respond.status(404).json({
            success:false,
            data:"Internal server error",
            message:"Failed To Delete section",
        });
    }
}
