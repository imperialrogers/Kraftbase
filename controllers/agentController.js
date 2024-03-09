//Package Imports
const express = require('express');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require('express-async-handler');
const reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const {Agent} = require("../models/delivery_agent");
const {Restaurant} = require("../models/restaurant");
const {FoodItem}=require("../models/food_item");
const {Order}=require("../models/order");


//Sign Up Agent
const signUpAgent = asyncHandler(async (req, res)=>{
    try {
    //****************get data from user in req.body*****************
    const {name, email, phone, password}=req.body;

    //VALIDATION:Checking for existing user
    const existingUser = await Agent.findOne({phone});
    if(existingUser) return res.status(400).json({msg: "Agent with the same Phone Number already exists"});

    //check password
    if(reg.test(password)) return res.status(500).json({msg: "Password is not strong enough"});

    //Hashing the password
    const hashedPassword = await bcryptjs.hash(password, 8);

    //Creating a new user
    let user = new Agent({
        name:name,
        email:email,
        phone: phone,
        password: hashedPassword,
    });

    //****************post data in the database**********************
    user= await user.save();
    //********************return the data to agent********************
    res.status(200).json(user);

    } catch (e) {
        res.status(500).json({error:e.message});
    }
});


//Find Agent By Mobile Number
const findAgentByPhone = asyncHandler(
    async (req, res) => {
        const phone=Number(req.params.phone);
        console.log(`${phone}`);
        const existingUser = await Agent.find({
            phone:{$regex: req.params.phone}
        });
        try{
            if(existingUser[0] != null){
                if(existingUser[0].phone == null || existingUser[0].phone == undefined){
                    res.send(201, {"result": false});
                }
                else {
                    res.status(200).json(existingUser[0]);
                }
            }else{
                res.send(201, {"result": false});
            }
            } catch (e) {
                console.log(e);
                res.status(500).json({error:e.message});
            }
        }
);



//Get all free Agents
const getFreeAgents = asyncHandler( async (req, res)=>{
    try {
        var agents = await Agent.find({isFree:true});
        // condition when no agents are free
        if(!agents || agents.length==0) return res.status(400).json({msg: "No Agents are Free at the moment"});
        
        res.status(200).json(agents);
        
    } catch (e) {
        res.status(500).json({error:e.message});
    }
});

//Automatically Allocate Order to Agent
const assignOrderToAgent = asyncHandler( async (req, res)=>{
    try {
        //****************get data from user in req.body*****************
        const {restaurantId, orderId}=req.body;

        //VALIDATION:Checking for existing user
        var freeAgent = await Agent.findOne({isFree:true});

        //check if the user is free
        if(!freeAgent) return res.status(500).json({msg: "No Delivery Agent is free at the moment"});
        
        var order=await Order.findById(orderId);
        //Check if the order is valid
        if(!order || order.restaurantId!=restaurantId) return res.status(402).json({msg: "Unauthorized Order ID or Restaurant ID"});
        //Check if the order is accepted or not
        if(order.deliveryStatus=="reviewPending") return res.status(402).json({msg: "Order yet to be approved by restaurant"});
        //If not accepted then return
        if(order.orderStatus=="rejected") return res.status(402).json({msg: "Order has been rejected by restaurant"});
        //Check if the order is already assigned to an agent
        if(order.agentId!="-1") return res.status(400).json({msg: "Order is already assigned to an agent with id "+order.agentId});
        //Updating the user
        freeAgent.isFree = false;
        freeAgent.orderID = orderId;
        console.log(freeAgent._id);
        order.agentId=freeAgent._id.toString();
        freeAgent=await freeAgent.save();
        order=await order.save();
        //********************return the data to agent********************
        res.status(200).json({message:`Order with id ${orderId} assigned to Agent ${freeAgent.name} and can be contacted on ${freeAgent.phone}  with id `+freeAgent._id});

    } catch (e) {
        res.status(500).json({error:e.message});
    }
});

//Update Delivery Status
const updateDeliveryStatus = asyncHandler( async (req, res)=>{
    try {
        //****************get data from user in req.body*****************
        const {orderId, agentId, status}=req.body;

        //VALIDATION:Checking for existing order
        var order = await Order.findById(orderId);
        if(!order) return res.status(400).json({msg: "Order with id "+orderId+" not found"});
        //Invalid Access by another agent
        if(order.agentId!=agentId) return res.status(400).json({msg: "Order has not been assigned to you!"});
        //check if the order is already in the status
        if(order.deliveryStatus==status) return res.status(400).json({msg: "Order is already in "+status+" status"});
        if(order.deliveryStatus=="delivered") return res.status(400).json({msg: "Order is already delivered"});
        if(order.deliveryStatus=="rejected") return res.status(400).json({msg: "Order is already rejected"});
        //Check if the status is valid
        let statuses=['cooking', 'outForDelivery', 'delivered'];
        if(!statuses.includes(status)) return res.status(400).json({msg: "Invalid status"});
        //If the status is delivered, then set agent free
        if(status=="delivered"){
            var agent = await Agent.findById(order.agentId);
            if(agent){
                agent.isFree=true;
                agent.orderID="-1";
                agent=await agent.save();
            }
        }
        order.deliveryStatus=status;
        order=await order.save();
        //********************return the data to agent********************
        res.status(200).json(order);

    } catch (e) {
        res.status(500).json({error:e.message});
    }
});

module.exports ={signUpAgent, findAgentByPhone, assignOrderToAgent, getFreeAgents, updateDeliveryStatus};