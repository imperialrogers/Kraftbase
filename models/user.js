const mongoose=require("mongoose");
const {orderSchema}=require("./order");

const userSchema=new mongoose.Schema({
    //User Name
    username:{
        type:String,
        default:"appUser",
        trim:true,
    },
    //Email
    email:{
        type:String,
        required:true,
        trim:true,
    },
    //Password
    password:{
        required: true,
        type:String
    },
    //Phone Number
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
    // User Type
    type:{
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    //User Address
    address:{
        type:String,
        default:"defaultAddr",
        required:true,
    },
    //Order List
    orders: [
        {
            order: orderSchema,
            quantity: {
                type: Number,
                required: true,
                validator:{
                    validator: (value) => {
                        return ((value>0) && (value<=100));
                    },
                    message: `All food items shall be between 0 and 100`,
                }
            },
        }
    ]
});


//Create a user model
const User = mongoose.model('User', userSchema);

//Export the model
module.exports={User, userSchema};