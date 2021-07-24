import express from 'express';
import { createServer } from "http";
import axios from 'axios';
import {Socket} from 'socket.io';
const app = express();
import mongoose from 'mongoose';
import DeviceData from './models/deviceData';
const httpServer = createServer(app);
const PORT = 2000|| process.env.port;
const options = { 
  origin:"*",
  cors:true,

}  

const io = require('socket.io')(httpServer,options)
const cloudURL = "mongodb+srv://nikhilpark:Nklplp12@@blog.ngngn.mongodb.net/sheruAPI?retryWrites=true&w=majority"

mongoose 
  .connect(
    cloudURL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Database Connected"))
  .catch(() => console.log("error"));


io.on("connection",async (socket:Socket)=>{

  const response = await axios.get("http://13.233.13.254:2222/xenergyData.json")
  const data:Array<any> = response.data.records
  const latestData = data[data.length-1]
  const tdataArray = latestData.tdata.split(',') 
  
  const tdata = {
    IMEI: tdataArray[0],
    latitude: tdataArray[1],
    longitude: tdataArray[2],
    voltages:{
      cell1:parseFloat(tdataArray[3]),
      cell2:parseFloat(tdataArray[4]),
      cell3:parseFloat(tdataArray[5]),
      cell4:parseFloat(tdataArray[6]),
      cell5:parseFloat(tdataArray[7]),
      cell6:parseFloat(tdataArray[8]),
      cell7:parseFloat(tdataArray[9]),
      cell8:parseFloat(tdataArray[10]),
      cell9:parseFloat(tdataArray[11]),
      cell10:parseFloat(tdataArray[12]),
      cell11:parseFloat(tdataArray[13]),
      cell12:parseFloat(tdataArray[14]),
      cell13:parseFloat(tdataArray[15]),
      cell14:parseFloat(tdataArray[16]),
    },
    avgCellVoltage:parseFloat(tdataArray[17]),
    packVoltage:parseFloat(tdataArray[18]),
    current:parseFloat(tdataArray[19]), 
    batteryPerc:parseInt(tdataArray[20]),
    
  }
  DeviceData.findOneAndUpdate({vid: latestData.vid},
     {$set: { vid: latestData.vid, created: latestData.created, tdata:tdata, recieved:Date.now()}}, {new: true}, (err, doc) => {
    if (err) {
        console.log("Something wrong when updating data!", err);
        
    }
   
});
})

app.get('/', (req, res) => res.send('home'));

app.get('/getdata',async (req,res)=>{
  const data  = await DeviceData.find({})
  res.send(data);
})


httpServer.listen(PORT,()=>{
  console.log(`Server is up !!`)
}
)