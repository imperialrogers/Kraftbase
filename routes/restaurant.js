//Package Imports
const express = require('express');

//Initializing and adding router functionality
const restaurantRouter = express.Router();

const {findRestaurantByGSTIN, signUpRestaurant, openRestaurants, shutterUp, shutterDown, 
    addFoodItem, getFoodItems, getAvailableFoodItems, updateFoodItem, getAllOrders, setOrderStatus} = require("../controllers/restaurantController");

//SignUp Restauratn
restaurantRouter.post("/api/restaurants/signup",  signUpRestaurant);
// List Of All Open Restaurants
restaurantRouter.get("/api/restaurants/openRestaurants",  openRestaurants);
// Get restaurant by GSTIN
restaurantRouter.get("/api/restaurants/:gstin",  findRestaurantByGSTIN);
//Open Restaurant
restaurantRouter.post("/api/restaurants/shutterup",  shutterUp);
//Close Restaurant
restaurantRouter.post("/api/restaurants/shutterdown",  shutterDown);
//Add Food Item
restaurantRouter.post("/api/restaurants/addFoodItem",  addFoodItem);
//Get All Food Items from specific restaurant
restaurantRouter.get("/api/restaurants/restaurantItems/:gstin", getFoodItems);
//Get Available Food Items from specific restaurant
restaurantRouter.get("/api/restaurants/availableItems/:gstin", getAvailableFoodItems);
//update food item
restaurantRouter.put("/api/restaurants/updateFoodItem", updateFoodItem);
//Get All Orders
restaurantRouter.get("/api/restaurants/getAllOrders/:restaurantId", getAllOrders);
//Set Order status
restaurantRouter.put("/api/restaurants/setOrderStatus", setOrderStatus);

module.exports = restaurantRouter;