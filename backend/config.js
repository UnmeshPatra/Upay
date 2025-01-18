// const JWT_SECRET = "unmeshsecret";
// module.exports = JWT_SECRET


require('dotenv').config();

module.exports = {
    MONGO_URI: "mongodb+srv://UnmeshPatra:uHYN9mo3wVMBTdV3@cluster0.pz1jvcm.mongodb.net/PayToMe?retryWrites=true&w=majority",
  };
  
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

module.exports = { JWT_SECRET };
