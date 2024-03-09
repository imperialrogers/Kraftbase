const mongoose=require("mongoose");
const {foodItemSchema}=require("./food_item");

const orderSchema=new mongoose.Schema({
    //User Id
    userId:{
        type:String,
        required:true
    },
    //Restaurant Id
    restaurantId:{
        type:String,
        required:true
    },
    //Delivery Agent Id
    agentId:{
        type:String,
        default:"-1",
    },
    //time
    orderedAt: {
        type: Number,
        required: true,
    },
    //Status Of Delivery
    deliveryStatus:{
        type: String,
        enum: ['reviewPending','cooking', 'outForDelivery', 'delivered', 'cancelled'],
        default: 'reviewPending'
    },
    // Accepted/Not Accepted By Restaurant
    orderStatus:{
        type:String,
        enum: ['orderPlaced', 'accepted', 'rejected'],
        default: 'orderPlaced'
    },
    //order Items
    foodItems: [
        {
            foodItem: foodItemSchema,
            quantity: {
                type: Number,
                required: true
            },
        },
    ],
    //Total Bill
    totalBill:{
        type: String,
        required: true
    },
    //Order Rating
    orderRating:{
        type: Number,
        default: -1,
    },
},
);


//Create a order model
const Order = mongoose.model('order', orderSchema);

//Export the order model
module.exports={Order, orderSchema};