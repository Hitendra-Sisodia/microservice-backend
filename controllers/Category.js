const Category = require("../models/Category");

// validation
// create entry in database
// success flag

exports.createCategory = async(request, respond) => {
    try{
        // extract name , and description from course
        const {name, description} = request.body;
        // validation
        if(!name || !description) {
            return respond.status(200).json({
                sucess:false,
                message:"All Fields are required",
            });
        }
        // create entry in database
        const categoryDetails = await Tag.createTag({name:name, description:description});
        console.log("Tag Details -----> ", categoryDetails);
        // return sucess flag
        respond.status(200).json({
            sucess:true,
            data:categoryDetails,
            message:"Tag Created successfully",
        });
    }
    catch(error){
        return respond.status(400).json({
            sucess:false,
            message:"Something went Wrong Internal Server error",
            error:error.message,
        });
    }
}

/*************************************************************************************************************** */
// getAllTags handler function


exports.showAllCategory = async(request, respond) => {
    try{
        const searchedCategory = await Tag.find({}, {name:true, description:true});
        return respond.status(200).json({
            sucess:true,
            message:"All tags returned successfully",
            data:searchedCategory,
        })
    }
    catch(error) {
        return respond.status(400).json({
            sucess:false,
            message:error.message,
        })
    }
};

/*************************************************************************************************************** */
//category Page Details

exports.categoryPageDetails = async(request, respond) => {
    try{
        // get category Id
        const {categoryId} = request.body;
        // get courses for specified catId
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();
        // validation
        if(!selectedCategory) {
            return respond.status(404).json({
                sucess:false,
                message:"Data Not found",
            })
        }
        // get courses for different cat
        const differentCategories = await Category.find({
            _id: {$ne: categoryId},
        }).populate("courses").exec();
        // get top selling courses ---> HW
        // return response
        return respond.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            }
        });
    }
    catch(error) {
        return respond.status(400).json({
            sucess:false,
            message:error.message,
        })
    }
};
