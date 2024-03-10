//Package Imports
const express = require('express');

//Initializing and adding router functionality
const userRouter = express.Router();

const {signupUser, orderFood, test, giveRatings} = require("../controllers/userController");

//Signup new user
userRouter.post("/api/user/signup",  signupUser);
//User Orders Food 
userRouter.post("/api/user/order",  orderFood);
//Testt(NOT IN USE/REQUIRED)
userRouter.post("/api/user/test",  test);
//give ratings to the order and agent
userRouter.post("/api/user/ratings",  giveRatings);

module.exports = userRouter;