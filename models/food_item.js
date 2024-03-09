const mongoose=require("mongoose");

//Food Item Schema
const foodItemSchema=new mongoose.Schema({
    restaurantId:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true,
        trim:true,
    },
    price:{
        type:Number,
        required:true,
    },
    description:{
        required:true,
        type: String,
    },
    isAvailable:{
        type:Boolean,
        default: true,
    },
    isVeg:{
        type:Boolean,
        required:true,
        default:true,
    },
    images:[{
        type: String,
        },
    ],
});


//Create a food item model
const FoodItem = mongoose.model('foodItems', foodItemSchema);

//Export the food item model
module.exports={FoodItem, foodItemSchema};