const {instance} = require("../config/razerpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");


// get userId and courseId
// valid course id
// valid courseDetails
// is already registered in course 
// order create 
// return success flag


// capture the payment and initiate the razerpay order
exports.capturePayemnt = async(request, respond) => {
    try{
        // get courseId and UserId
        const {course_id} = request.body;
        const userId = request.user.id;
        // validation // valid courseId
        if(!course_id || !userId) {
            return respond.status(401).json({
                success:false,
                message:"Please Provide Valid couse id",
            });
        }
        // valid existingCourseDetails
        let existingCourseDetails;
        try{
            existingCourseDetails = await Course.findById({_id:course_id});
            if(!existingCourseDetails) {
                return respond.status(402).json({
                    success:false,
                    nessage:"Could Not Find the course",
                });
            }
            const uid = new mongoose.Types.ObjectId(userId);
            // user already pay for the same course
            if(existingCourseDetails.studentsEnrolled.includes(uid)){
                return respond.status(200).json({
                    success:false,
                    message:"Students is already enrolled",
                });
            }
        }
        catch(error) {
            console.log(error);
            return respond.status(400).json({
                success:false,
                message:error.message,
            });
        }
        // create order
        const amount = existingCourseDetails.price;
        const currency = "INR";
        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: Math.random(Date.now()).toString,
            notes: {                    // This is used in signature verification
                courseId: course_id,
                userId,
            }
        };
        try{
            // initiate the payement using razerpay 
            const payementResponse = await instance.orders.create(options);
            console.log(payementResponse);
            // return succces flag
            return respond.status(200).json({
                success:false,
                courseName: existingCourseDetails.courseName,
                courseDescription:existingCourseDetails.courseDescription,
                thumbnail: existingCourseDetails.thumbnail,
                orderId: payementResponse.id,
                currency: payementResponse.currency,
                amount : payementResponse.amount,
            });
        }
        catch(error){
            console.log(error);
            respond.status(405).json({
                success:false,
                message:"Could not initiate order",
            });
        }
        // return response
    }
    catch(error) {
        console.log(error);
        return respond.status(400).json({
            success:false,
            data:"Internal server error",
            message:"Something went wrong while creating order",
            error:error.message,
        });
    }
}

// verify Signature of Razerpay and Server
exports.verifySignature = async(request, respond) => {
    const webhookSecret = "12345678";
    const signature = request.headers["x-razerpay-signature"];
    // now convert webhooksecret
    const shasum = crypto.createHmaca("sha256", webhookSecret);
    shasum.update(JSON.stringify(request.body));
    const digest = shasum.digest("hex");
    if(signature == digest) {
        console.log("Payment is Authorized");
        const {courseId, userId} = request.body.payload.payment.entity.notes;
        try {
            // user ko course m enroll karo
            const enrolledCourse = await Course.findOneAndUpdate({_id:courseId}, {$push: {studentsEnrolled: userId}}, {new:true});
            if(!enrolledCourse) {
                return respond.status(500).json({
                    success:false,
                    message:"Course Not Found",
                });
            }
            // find student and add course to their courses
            const enrolledStudent = await User.findByIdAndUpdate({_id:userId}, {$push: {courses: enrolledCourse._id}}, {new:true});
            // send confirmation mail 
            const emailResponse = await mailSender(
                enrolledCourse.email,
                "Conguratulations from Hitendra/Edtech Master",
                "Conguratulations, You are successfully registered in Course",
            )
            console.log(emailResponse);
            return responst.status(200).json({
                success:true,
                message:"Signature verified and course added",
            });
        }
        catch(error) {
            console.log(error);
            return respond.status(400).json({
                success:false,
                data:"Internal server error",
                message:"Something went wrong while verify signature",
                error:error.message,
            });
        }
    }
    else{
        return respond.status(300).json({
            success:false,
            message:"Invalid Response",
        });
    }
}

