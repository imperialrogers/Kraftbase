const mongoose=require("mongoose");

const dASchema=new mongoose.Schema({
    //name of agent
    name:{
        type:String,
        default:"delivery agent",
        required:true,
        trim:true,
    },
    //Email
    email:{
        type:String,
        required:true,
        trim:true,
    },
    //mobile number
    phone:{
        type:String,
        required:true,
        default: "1111111111",
        validate:{
            validator: (value) => {
                const reg = /^[0-9]{10}$/;
                return reg.test(value);
            },
            message: "Please enter a valid mobile number",
        },
    },
    //password
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
        // },
    },

    //is agent Free?
    isFree:{
        type: Boolean,
        default: true,
    },
    //order id
    orderID:{
        type: String,
        default: "-1",
    },
    //ratings
    ratings:{
        type:Number,
        default: 0
    },
    //total rated
    totalRated:{
        type:Number,
        default: 0
    }
},
);


//Create a delivery agent model
const Agent = mongoose.model('Agent', dASchema);

//Export the model
module.exports={Agent, dASchema};