const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

// create rating and review
exports.createRating = async(request, respond ) => {
    try{
        // get user id
        const userId = request.id;
        // get rating , review and course 
        const {courseId, rating, review } = request.body;
        // check if user is enrolled or not
        const courseDetails = await Course.findById({_id:courseId, studentEnrolled: {$elemMatch: {$eq: userId}}});
        if(!courseDetails) {
            return respond.status(404).json({
                success:false,
                message:"Students is not enrolled in the course",
            })
        }
        // check if user already review the course
        const checkAlreadyReviewd = await RatingAndReview.findOne({user:userId, course:courseId});
        if(checkAlreadyReviewd) {
            return respond.status(300).json({
                success:false,
                message:"Course is already reviewed by the user",
            })
        }
        // create a rating and review
        const newRatingAndReview = await RatingAndReview.create({
            user:userId,
            rating:rating,
            review:review,
            course:courseId,
        });
        // update ref in Course
        const updatedCourseWithNewRatingAndReview = await Course.findByIdAndUpdate({_id:courseId}, {$push: {ratingAndReviews: newRatingAndReview._id}}, {new:true});
        // send success flag
        respond.status(200).json({
            success:true,
            message:"Rating and Review created successfully",
            data:newRatingAndReview,
        })
    }
    catch(error){
        respond.status(300).json({
            success:false,
            message:"Internal Server error",
            error:error.message,
        });
    }
}


/********************************************************************************************************************* */

// find average rating

exports.getAverageRating = async(request, respond) => {
    try{
        // get courseId
        const {courseId} = request.body;
        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $math:{
                    course: new mongoose.Types.ObjectOd(courseId),
                },
            },
            {
                $group: {
                    _id:null,
                    averageRating: {$avg: "$rating"},
                }
            }
        ])
        // return rating
        if(result.length > 0) {
            return respond.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            });
        } 
        // if no rating and reviews
        return respond.status(200).json({
            success:false,
            message:"Average rating is 0 as no rating is given now",
            averageRating:0,
        })
    }
    catch(error){
        respond.status(300).json({
            success:false,
            message:"Internal Server error",
            error:error.message,
        });
    }
}

/*********************************************************************************************************************/

// getAllRatings
exports.getAllRating = async(request, respond) => {
    try{
        const allReviews = await RatingAndReview.find({}).sort({rating:"desc"})
            .populate({
                path:"user",
                select:"firstName lastName email image",
            }).populate({
                path:"course",
                select:"courseName",
            }).exec();
        
        return respond.status(200).json({
            success:false,
            message:"All course details fetched successfully",
            data:allReviews,
        });
    }
    catch(error){
        respond.status(300).json({
            success:false,
            message:"Internal Server error",
            error:error.message,
        });
    }
}
