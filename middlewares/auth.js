const jwt = require("jsonwebtoken");
require("dotenv").config();

// This middleware used for Authentication and authorization

// auth
exports.auth = async(request, respond, next) => {
    try{
        // extract token
        const token = request.cookies.token || request.body.token || req.header("Authorisation").replace("Bearer ","");
        // if token missing, return response
        if(!token && token == undefined) {
            return respond.status(400).json({
                success:true,
                message:"token is empty or undefined",
            });
        }
        try{
            const payload = await jwt.compare(token, process.env.JWT_SECRET);
            console.log(payload);
            request.user = payload;
        }
        catch(error) {
            return respond.status(400).json({
                success:false,
                message:"Invalid json web token",
            });
        }
        next();
    }
    catch(error){
        console.log(error);
        respond.status(600).json({
            success:false,
            message:"Internal server error",
            error:message.error,
        })
    }
}

/*******************************************************************************************************/

// isStudent
exports.isStudent = async(request, respond, next) => {
    try{
        if(request.body.accountType !== "Student") {
            return respond.status(501).json({
                success:false,
                message:"This is protected route for student only",
            })
        }
    }
    catch(error){
        console.log(error);
        respond.status(600).json({
            success:false,
            message:"Internal server error",
            error:message.error,
        })
    }
}

/******************************************************************************************************* */

    // isInstructor
exports.isInstructor = async(request, respond, next) => {
    try{
        if(request.body.accountType !== "Instructor") {
            return respond.status(501).json({
                success:false,
                message:"This is protected route for Instructor only",
            })
        }
    }
    catch(error){
        console.log(error);
        respond.status(600).json({
            success:false,
            message:"Internal server error",
            error:message.error,
        })
    }
}



/******************************************************************************************************* */

// isAdmin

exports.isAdmin = async(request, respond, next) => {
    try{
        if(request.body.accountType !== "Admin") {
            return respond.status(501).json({
                success:false,
                message:"This is protected route for admin only",
            })
        }
    }
    catch(error){
        console.log(error);
        respond.status(600).json({
            success:false,
            message:"Internal server error",
            error:message.error,
        })
    }
}