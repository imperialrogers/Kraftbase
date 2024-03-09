const mongoose=require("mongoose");
const {foodItemSchema}=require("./food_item");

const restaurantSchema=new mongoose.Schema({
    //Restaurant Name
    name:{
        type:String,
        default:"appUser",
        trim:true,
    },
    //Restaurant Email
    email:{
        type:String,
        required:true,
    },

    //GSTIN Number
    gstin:{
        type:String,
        required:true,
        trim:true,
    },

    //Password
    password:{
        required: true,
        type:String,
        // validate:{
        //     validator: (value) => {
        //         // alphanumeric and length 8-20
        //         const reg = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/;
        //         return reg.test(value);
        //     },
        //     message: "Please enter a valid and strong password",
        // }
    },
    //Restaurant Phone Number
    phone:{
        type:String,
        default: "1111111111",
        validate:{
            validator: (value) => {
                const reg = /^[0-9]{10}$/;
                return reg.test(value);
            },
            message: "Please enter a valid mobile number",
        },
    },

    //Address
    address:{
        type:String,
        default:"defaultAddr",
        required:true
    },
    status:{
        type:String,
        enum:['online', 'offline'],
        default: 'online',
    }
},);


//Create a order model
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

//Export the order model
module.exports={Restaurant, restaurantSchema};