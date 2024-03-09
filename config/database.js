//Connection Of MONGODB Database
const mongoose=require("mongoose");
const constants=require("./constants");

const connectDB = async () => {
    try {
        const connect =  await mongoose.connect(`${constants.dbLink}`).then(()=>{
            console.log("Connection Established With MONGODB Successfully");
        }).catch(err => {
            console.log(`(Error) Some ERROR OCCURRED: ${err}`);
            // process.exit(1);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports=connectDB;