//Package Imports
const express = require("express");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler');
const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const {User} = require("../models/user");
const {Agent} = require("../models/delivery_agent");
const {Order} = require("../models/order");
const {FoodItem} = require("../models/food_item");
const { Restaurant } = require("../models/restaurant");

//Signup new user
const signupUser = asyncHandler( async(req, res)=>{
        try{
            //****************get data from user in req.body*****************
            const {name, email, phone, password, address}=req.body;

            //VALIDATION:Checking for existing user
            const existingUser = await User.findOne({phone});
            if(existingUser) return res.status(400).json({msg: "User with the same Phone Number already exists"});

            //check password
            if(reg.test(password)) return res.status(500).json({msg: "Password is not strong enough"});

            //Hashing the password
            const hashedPassword = await bcryptjs.hash(password, 8);

            //Creating a new user
            let user = new User({
                username:name,
                email:email,
                phone: phone,
                password: hashedPassword,
                address: address,
            });

            //****************post data in the database**********************
            user= await user.save();
            //********************return the data to agent********************
            res.status(200).json(user);
        } catch (e) {
            res.status(500).json({error:e.message});
        }

    }
);

const test=asyncHandler(async(req,res)=>{
    try {
        const {phone, password}=req.body;
        //VALIDATION:Checking for existing user
        let existingUser=await User.findOne({phone:phone});
        if(!existingUser || phone.length!=10){
            res.status(400).json({msg: "User not found"});
        }
        const isMatch = await bcryptjs.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Incorrect password." });
        }
        res.json(existingUser);
    } catch (error) {
        console.log(error.message);
    }
});

//Order food
const orderFood = asyncHandler( async(req, res)=>{
    const {phone, password, cartItems}=req.body;
    try {
        //VALIDATION:Checking for existing user
        let existingUser=await User.findOne({phone:phone});
        if(!existingUser || phone.length!=10){
            res.status(400).json({msg: "User not found"});
        }
        const isMatch = await bcryptjs.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Incorrect Credentials." });
        }
        if(cartItems.length==0) res.status(400).json({msg: "Cart is empty"});
        let orderItems=[]; // Food ID + quantity
        let total=0;
        let sampleFood=await FoodItem.findById(cartItems[0].id);
        let restaurant=await Restaurant.findById(sampleFood.restaurantId);
        for(let i=0; i<cartItems.length; i++){
            const item=await FoodItem.findById(cartItems[i].id);
            const quantity=cartItems[i].quantity;
            if(item){
                if(quantity>0 && quantity<=100 && restaurant.id==item.restaurantId){
                    orderItems.push({item, quantity});
                    total+=(item.price*quantity);
                } else {
                    res.status(400).json({msg: `Please enter quantity between 0 and 100 for item ${item.name} or order from same restaurant only`});
                }
            }
            else{
                res.status(400).json({msg: `Food Item for ${cartItems[i].id} not found`});
            }
        }
        let order = new Order({
            userId:existingUser._id.toString(),
            restaurantId: restaurant._id.toString(),
            orderedAt: new Date().getTime(),
            foodItems: orderItems,
            totalBill: total
        });
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({error:error.message});
}});

//Give ratings
const giveRatings = asyncHandler( async(req, res)=>{
    const {phone, password, orderId, agentRating, orderRating}=req.body;
    try {
        //VALIDATION of user
        let existingUser=await User.findOne({phone});
        if(!existingUser || phone.length!=10) res.status(400).json({msg: "User not found"});
        if(!agentRating || !orderRating) res.status(400).json({msg: "Please enter ratings for agent and orders both"});
        //password checking
        const isMatch = await bcryptjs.compare(password, existingUser.password);
        if(!isMatch) res.status(400).json({msg: "Incorrect Credentials"});
        //VALIDATION of order
        let order=await Order.findById(orderId);
        if(!order || order.userId!=existingUser._id.toString())return res.status(400).json({msg: "Order not found"});
        if(order.deliveryStatus!="delivered") return res.status(400).json({msg: "Order not delivered yet"});
        if(order.orderRating!=-1) return res.status(400).json({msg: "Order and agent already rated"});
        //give ratings to the order and agent
        order.orderRating=orderRating;
        await order.save();
        let agent=await Agent.findById(order.agentId);
        agent.totalRated+=1;
        agent.ratings += Number(agentRating);
        await agent.save();
        return res.status(200).json({msg:"Thanks for your valueable feedback!"});

    } catch (error) {
        return res.status(500).json(error);
    }
});

module.exports = {signupUser,orderFood,test, giveRatings}