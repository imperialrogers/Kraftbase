//Package Imports
const express = require('express');

//Initializing and adding router functionality
const agentRouter = express.Router();

const {signUpAgent, findAgentByPhone, assignOrderToAgent,getFreeAgents, updateDeliveryStatus} = require("../controllers/agentController");

//Finding Agent By Phone
agentRouter.get("/api/agent/findAgent/:phone",  findAgentByPhone);
// Sign Up Delivery Agent
agentRouter.post('/api/agent/signup', signUpAgent);
// Assign Order To any agent
agentRouter.post('/api/agent/assignOrder', assignOrderToAgent);
//Finding Free Agents
agentRouter.get("/api/agents/free",  getFreeAgents);
//Update delivery status
agentRouter.put('/api/agent/updateDeliveryStatus', updateDeliveryStatus);

module.exports = agentRouter;