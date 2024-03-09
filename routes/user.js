//Package Imports
const express = require('express');

//Initializing and adding router functionality
const userRouter = express.Router();

const {signupUser, orderFood, test, giveRatings} = require("../controllers/userController");

//Signup user
userRouter.post("/api/user/signup",  signupUser);
//Order Food
userRouter.post("/api/user/order",  orderFood);
//Testt
userRouter.post("/api/user/test",  test);
//give ratings
userRouter.post("/api/user/ratings",  giveRatings);

module.exports = userRouter;