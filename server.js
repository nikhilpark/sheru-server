const express = require('express');
const  { createServer }  = require("http")

const axios =  require("axios")
const { Socket } =  require("socket.io")
const cors = require("cors");
const app = express();
const {InfluxDB} = require("@influxdata/influxdb-client");
const {Point} = require('@influxdata/influxdb-client')

const httpServer = createServer(app);

const options = {
  origin: "*",
  cors: true,
};

const io = require("socket.io")(httpServer, options);

const token = 'R4XIWky5jfHufnUbBRVyG0WOhNcjLrhUeVcFPo4SvmwzXZpv2fZd-OLClMhzbY_gBh45y9LKtgZgSbmdMyZaaw=='
const org = 'nikhil.nklp@gmail.com'
const bucket = "nikhil.nklp's Bucket"
const client = new InfluxDB({url: 'https://us-east-1-1.aws.cloud2.influxdata.com', token: token})

const writeApi = client.getWriteApi(org, bucket)
writeApi.useDefaultTags({host: 'host1'})


app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
 
// io.on("connection", async (socket) => {
  const fetchInterval = setInterval(async()=>{
    const response = await axios.get(
      "http://13.233.13.254:2222/xenergyData.json"
    );
    const data = response.data.records;
    // const tdataArray= []
  
  
    data.forEach((el=> {
      const tdataArray = el.tdata.split(",");
      const tdata = {
        IMEI: tdataArray[0],
        latitude: tdataArray[1],
        longitude: tdataArray[2],
        voltages: {
          cell1: parseFloat(tdataArray[3]),
          cell2: parseFloat(tdataArray[4]),
          cell3: parseFloat(tdataArray[5]),
          cell4: parseFloat(tdataArray[6]),
          cell5: parseFloat(tdataArray[7]),
          cell6: parseFloat(tdataArray[8]),
          cell7: parseFloat(tdataArray[9]),
          cell8: parseFloat(tdataArray[10]),
          cell9: parseFloat(tdataArray[11]),
          cell10: parseFloat(tdataArray[12]),
          cell11: parseFloat(tdataArray[13]),
          cell12: parseFloat(tdataArray[14]),
          cell13: parseFloat(tdataArray[15]),
          cell14: parseFloat(tdataArray[16]),
        },
        avgCellVoltage: parseFloat(tdataArray[17]),
        packVoltage: parseFloat(tdataArray[18]),
        current: parseFloat(tdataArray[19]),
        batteryPerc: parseInt(tdataArray[20]),
      };
      el.tdata = tdata;
  
      // console.log(data)
    //   const point = new Point('data')
    //   .floatField('batteryperc',tdata.batteryPerc)
    //   .floatField('longitude',parseFloat(tdataArray[2]))
    //   .floatField('used_percent', 23.43234543)
    // writeApi.writePoint(point)
    // writeApi
    //     .flush()
    //     .then((d) => {
    //         console.log(d)
    //     })
    //     .catch(e => {
    //         console.error(e)
    //         console.log('Finished ERROR')
    //     })
      
    }));
  
    const point = new Point('data')
      .floatField('batteryperc',data[data.length-1].tdata.batteryPerc)
      .floatField('lon',data[data.length-1].tdata.longitude)
      .floatField('lat',data[data.length-1].tdata.latitude)
      .floatField('avgCellVoltage',data[data.length-1].tdata.avgCellVoltage)
      .floatField('packVoltage',data[data.length-1].tdata.packVoltage)
      .floatField('current',data[data.length-1].tdata.current)
    writeApi.writePoint(point)
    writeApi
        .flush()
        .then(() => {
         
            console.log(`Done`)
        })
        .catch(e => {
            console.error(e)
            console.log('Finished ERROR')
        })
  },10000)
  
// writeApi.close()
// });

// app.get("/query",(req,res)=>{
//   clearInterval(fetchInterval);
//   const queryApi = client.getQueryApi(org)
//   console.log('das')

// const query = `select * from nikhil.nklp's Bucket`
// queryApi.queryRows(query, {
//   next(row, tableMeta) {
//     const o = tableMeta.toObject(row)
//     console.log(row)
//     console.log(tableMeta)
//     res.send(
//       o
//     )
//   },
//   error(error) {
//     console.error(error)
//     console.log('Finished ERROR')
//   },
//   complete() {
//     console.log('Finished SUCCESS')
//   }
// })

// })

app.get("/", (req, res) => res.send("home"));

// app.get("/getdata", async (req, res) => {
//   const data = await DeviceData.find({}); 
//   res.send(data);
// });

httpServer.listen(3000, () => {
  console.log(`Server is up !!`);
});
 