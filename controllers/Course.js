const { request } = require("express");
const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadFileToCloudinary} = require("../utils/imageUploader");
require("dotenv").config();

    // extract data from frontend and files
    // perform data validation
    // extract user from token i.e an instructor
    // chcek instructor validity
    // perform Categorys validity
    // upload image to cloudinary 
    // create course in db
    // update User schema  ---> Student Enrolled in that course
    // update Category Model ---> Update current newCourse id in Category Model
    // send success flag


exports.createCourse = async(request, respond) => {
    try{
        // extract data from frontend and files 
        const {courseName, courseDescription, whatYouWillLearn, price, category} = request.body;
        const {thumbnail} = request.files.thumbnailImage;
        // perform data validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
            return respond.status(400).json({
                success:false,
                mesage:"All fields are required",
            });
        }
        // check for instructor ----> why hear ?? we already perform validation in middlware {reason: to get instructor id from middleware token}
        const findUserId = request.user.id;  // from auth middleware
        const instructorDetails = await User.findById(findUserId);
        // TODO: verify that findUserId and instructorDetails are same id or not ??
        console.log("instructor Details ", instructorDetails);
        if(!instructorDetails) {
            return respond.status(404).json({
                success:false,
                message:"Instructor Details not found",
            });
        }
        // perform Categorys validity
        const categoryDetails = await Category.findById({category});
        if(!categoryDetails) {
            return respond.status(405).json({
                success:false,
                message:"Please Enter a valid Category",
            })
        }
        // upload image to cloudinary 
        const thumbnailImageUrl = await uploadFileToCloudinary(thumbnail, process.env.FOLDER_NAME)  // extact file path, folder name
        // create course in db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            thumbnail: thumbnailImageUrl,
            category:categoryDetails._id, // tagDetails,_id,tag both are correct   // This is tag id Not tag name
            // remaning all things are passed by reference
        })
        // add course entry in user schema   ---> Student Enrolled in that course
        const updatedUserWithCourse = await User.findByIdAndUpdate(
            {id: instructorDetails._id}, {$push: {courses: newCourse._id}}, {new:true}).populate("courses").exec();
        // update the tag schema // TODO improvement needed
        const updatedCategoryWithCourse = await Category.findByIdAndUpdate({category}, {$push:{course: newCourse._id}}, {new:true}).populate("course").exec();
        // send success flag
        return respond.status(200).json({
            success:true,
            message:"Course Created successfully User Updated successfully Tag is not updated",
            data:newCourse,
        });
    }
    catch(error) {
        respond.status(403).json({
            success:false,
            data:"Internal Server Error",
            message:"Something went wrong while creating a course",
            error:error.message,
        });
    }
}

/******************************************************************************************************************************************** */

// getAllCourses handler function

exports.showAllCourses = async(request, respond) => {
    try{
        // ToDo: change
        const allCourses = await Course.find({});
        if(!allCourses){
            return respond.status(200).json({
                success:false,
                message:"Not able to fetch the courses",
                error:message.error,
            });
        }
        return respond.status(200).json({
            success:true,
            message: "Data for all courses fetched successfully",
            data: allCourses,
        });
    }
    catch(error) {
        console.log(error);
        respond.status(500).json({
            success:false,
            data:"Internal Server error",
            message:"Something went wrong not able to fetch course data",
            error:error.message,
        })
    }
}


/******************************************************************************************************************* */

exports.getCourseDetails = async(request , respond) => {
    try{
        // get id
        const {courseId} = request.body;
        // find course details
        const getExistingCourseDetails = await Course.findById(
            {_id:courseId}
            ).populate({
                path:"instructor", 
                populate:{path:"additionalDetails"},
            }).populate("categoty")
            .populate("ratingAndReviews")
            .populate({
                path:"courseContent",
                poplate:{
                    path:"subSection",
                },
            }
        )
        .exec();
        if(!getExistingCourseDetails) {
            return respond.status(400).json({
                success:false,
                message:`Could Not Find the course with ${courseId}`,
            })
        }
        return respond.status(200).json({
            success:true,
            message:"Could Details fetched successfully",
        })
    }
    catch(error) {
        console.log(error);
        respond.status(500).json({
            success:false,
            data:"Internal Server error",
            message:"Something went wrong not able to fetching all course details",
            error:error.message,
        })
    }
}