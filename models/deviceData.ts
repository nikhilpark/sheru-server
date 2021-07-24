import mongoose from "mongoose"

 const deviceDataSchema = new mongoose.Schema({

    vid: String,
    created: String,
    recieved: {
        type: Date,
        default:Date.now},
    tdata:Object,
})

 export default mongoose.model('DeviceData',deviceDataSchema);
