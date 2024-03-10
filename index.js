//Dependencies
const express=require("express");
const initDatabase=require("./config/database");
const agentRouter = require('./routes/agent.js');
const restaurantRouter = require('./routes/restaurant.js');
const userRouter = require('./routes/user.js');

//Variables
const PORT = process.env.PORT || 8080;
const application = express();

//Middlewares
application.use(express.json());
application.use(agentRouter);
application.use(restaurantRouter);
application.use(userRouter);

//Connect DB
initDatabase().then(()=>{

    //Listening To Port
    application.listen(PORT, "0.0.0.0", ()=>{
        console.log(`Listening To The Port: ${PORT}`);
    });

});