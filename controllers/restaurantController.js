//Package Imports
const express = require('express');
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler');

const {Restaurant} = require("../models/restaurant");
const {FoodItem}=require("../models/food_item");
const {Order}=require("../models/order");


const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// const passwordReg = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/;

//Find Existing Restaurant By GSTIN
const findRestaurantByGSTIN = asyncHandler(
    async (req, res) => {
        const {gstin}=req.params;
        const restaurant = await Restaurant.findOne({gstin: gstin});
        try{
            //Restaurant Found
            if(restaurant){
                res.status(200).json(restaurant);
            }
            //Restaurant not found
            else{
                res.status(404).json({message: "Restaurant not found!"});
            }
            } catch (e) {
                console.log(e);
                res.status(500).json({error:e.message});
            }
        }
);


//Register A New Restaurant
const signUpRestaurant = asyncHandler(async (req, res)=>{
    try {
        //****************get data from user in req.body*****************
        const {name, email, gstin, password, phone, address,}=req.body;

        //VALIDATION:Checking for existing restaurant
        const existingRestaurant = await Restaurant.findOne({gstin});
        if(existingRestaurant) return res.status(400).json({msg: "Your Restaurant is already registered!"});

        //check password
        if(reg.test(password)) return res.status(500).json({msg: "Password is not strong enough"});

        //Hashing the password
        const hashedPassword = await bcryptjs.hash(password, 8);

        //Creating a new user
        let user = new Restaurant({
            name:name,
            email:email,
            gstin: gstin,
            password: hashedPassword,
            phone: phone,
            address: address
        });

        //****************post data in the database**********************
        user= await user.save();
        //********************return the data to agent********************
        res.status(200).json({message:"Congratulations! Your Restaurant is registered successfully!"});

    } catch (e) {
        res.status(500).json({error:e.message});
    }
});

//Open Restaurant
const shutterUp = asyncHandler(
    async (req, res) => {
        const {gstin}=req.body;
        try{
            const restaurant = await Restaurant.findOne({gstin: gstin});
            if(restaurant){
                //If restaurant is already open
                if(restaurant.status == 'online') return res.status(400).json({message: "Your Restaurant is already open!"});
                //Else open the restaurant
                restaurant.status = 'online';
                await restaurant.save();
                res.status(200).json({message: "Your Restaurant is now open!"});
            }
            //Handle if wrong GSTIN
            else{
                res.status(400).json({message: "Restaurant not found!"});
            }
        }
        catch(e){
            res.status(500).json({error:e.message});
        }
    }
);

//close Restaurant
const shutterDown= asyncHandler(
    async (req, res) => {
        const {gstin}=req.body;
        try{
            //Finding the restaurant
            const restaurant = await Restaurant.findOne({gstin: gstin});
            if(restaurant){
                //If restaurant is already closed
                if(restaurant.status == 'offline') return res.status(400).json({message: "Your Restaurant is already closed!"});
                restaurant.status = 'offline';
                await restaurant.save();
                res.status(200).json({message: "Your Restaurant is now closed!"});
            }
            //Handle if wrong GSTIN
            else{
                res.status(400).json({message: "Restaurant not found!"});
            }
        }
        catch(e){
            res.status(500).json({error:e.message});
        }
    }
);

//Add Food Item
const addFoodItem = asyncHandler(
    async (req, res) => {
        const {gstin, name, price, description, isAvailable, isVeg}=req.body;
        try{
            const restaurant = await Restaurant.findOne({gstin: gstin});
            if(restaurant){
                const check = await FoodItem.findOne({ name: name, restaurantId: restaurant._id.toString()});
                //If food item already exists or null values
                if(check || name == null || description == null || isAvailable == null || isVeg == null) return res.status(400).json({message: "Item Exists with same name or enter valid details!"});
                let newItem = new FoodItem({
                    restaurantId: restaurant._id.toString(),
                    name: name,
                    price:price,
                    description: description,
                    isAvailable: isAvailable,
                    isVeg: isVeg
                });
                newItem=await newItem.save();
                res.status(200).json({message: `Food Item ${name} added successfully to your restaurant ${restaurant.name}`});
            } //Handle if wrong GSTIN
            else{
                res.status(400).json({message: "Please Validate your restaurant!"});
            }
        }
        catch(e){
            res.status(500).json({error:e.message});
        }
    }
);

//List Of Open Restaurants
const openRestaurants = asyncHandler(
    async (req, res) => {
        try{
            //Finding all open restaurants
            const openRestaurants = await Restaurant.find({status: 'online'});
            res.status(200).json(openRestaurants);
        }
        catch(e){
            res.status(500).json({error:e.message});
        }
    }
);
//Get All Food Items from specific restaurant
const getFoodItems = asyncHandler(
    async (req, res) => {
        const gstin=String(req.params.gstin);
        try{
            const check = await Restaurant.findOne({gstin: gstin});
             if(check!=null){
                const allFoodItems = await FoodItem.find({restaurantId: check._id.toString()});
                res.status(200).json(allFoodItems);
            }
            else{
                res.status(404).json({message: "Requested Restaurant Not Found!"});
            }
        }
        catch(e){
            res.status(500).json({error:e.message});
        }
    }
);

//Get All Available Food Items from specific restaurant
const getAvailableFoodItems = asyncHandler(
    async (req, res) => {
        const gstin=String(req.params.gstin);
        try{
            const check = await Restaurant.findOne({gstin: gstin});
            //If restaurant exists
             if(check!=null){
                const allFoodItems = await FoodItem.find({isAvailable: true});
                res.status(200).json(allFoodItems);
            }//If restaurant not found
            else{
                res.status(404).json({message: "Requested Restaurant Not Found!"});
            }
        }
        catch(e){
            res.status(500).json({error:e.message});
        }
    }
);

// Update Food Item
const updateFoodItem = asyncHandler(
    async (req, res) => {
        const {id, restaurantId, name, price, description, isAvailable, isVeg}=req.body;
        try{
            const foodItem = await FoodItem.findOne({_id: id.toString(), restaurantId: restaurantId.toString()});
            if(foodItem){
                //If no field is updated
                if(name == null && price == null && description == null && isAvailable == null && isVeg == null) return res.status(400).json({message: "Please update atleast one of the fields!"});
                //Else update the fields entered by user
                if(name)foodItem.name = name;
                if(price)foodItem.price = price;
                if(description)foodItem.description = description;
                if(isAvailable)foodItem.isAvailable = isAvailable;
                if(isVeg)foodItem.isVeg = isVeg;
                await foodItem.save();
                res.status(200).json({message: "Food Item Updated Successfully!"});
            }
            else{
                res.status(400).json({message: "Food Item Not Found!"});
            }
        }
        catch(e){
            res.status(500).json({error:e.message});
        }
    }
);

//Get All Orders
const getAllOrders = asyncHandler(
    async(req, res)=>{
        try{
            const restaurantId = req.params.restaurantId;
            //If no restaurant Id
            if(!restaurantId) return res.status(400).json({message: "Please enter a valid restaurant Id!"});
            const allOrders = await Order.find({restaurantId: restaurantId});
            //If no orders found
            if(allOrders.length==0) return res.status(400).json({message: "No Orders Found for your restaurant yet!"});
            return res.json(allOrders);
        }
        catch(e){
            return e.message;
        }
    }
);

//Set Order Status
const setOrderStatus = asyncHandler(
    async(req, res)=>{
        //List of valid statuses
        let statuses=['orderPlaced', 'accepted', 'rejected'];
        try {
            const {status, orderId, restaurantId} = req.body;
            const restaurant = await Restaurant.findById(restaurantId);
            //Handle for unauthorized restaurant
            if(!restaurant) return res.status(400).json({message: "Unauthorized!"});
            //Handle for invalid status
            if(!statuses.includes(status)) return res.status(400).json({message: "Please select a valid status!"});
            const order = await Order.findById(orderId);
            //cant modify once order rejected
            if(order.orderStatus=='rejected' || order.orderStatus=='accepted') return res.status(400).json({message: `Order already ${order.orderStatus}!`});
            order.orderStatus=status;
            //if rejected update status
            if(status=='rejected'){
                order.deliveryStatus='cancelled';
                order.orderStatus='rejected';
            }
            //if accepted start cooking
            if(status=='accepted') order.deliveryStatus='cooking';
            await order.save();
            return res.status(200).json(order);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    }
);

module.exports ={findRestaurantByGSTIN, signUpRestaurant, openRestaurants, shutterUp, shutterDown, addFoodItem, getFoodItems, getAvailableFoodItems, updateFoodItem, getAllOrders, setOrderStatus};