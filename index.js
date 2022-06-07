'use strict'
// index.js
// This is our main server file

// A static server using Node and Express
const express = require("express");

// local modules
const db = require("./sqlWrap");
// const dbo = require("./databaseOps");
const win = require("./pickWinner");


// gets data out of HTTP request body 
// and attaches it to the request object
const bodyParser = require('body-parser');


/* might be a useful function when picking random videos */
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}


/* start of code run on start-up */
// create object to interface with express
const app = express();

// Code in this section sets up an express pipeline

// print info about incoming HTTP request 
// for debugging
app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
})
// make all the files in 'public' available 
app.use(express.static("public"));

// if no file specified, return the main page
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/compare.html");
});

// Get JSON out of HTTP request body, JSON.parse, and put object into req.body
app.use(bodyParser.json());
app.use(bodyParser.text());

// Gets JSON out of the HTTP requests and attaches the resulting object to the req object
app.use(express.json());

// WHAT I ADDED!!!----------------
// this is where the server receives and responds to POST requests
app.post("/insertPref", (req, res) =>{
  console.log("sending response...");
  // console.log("Data received: ", req.body);

  insertAndCount(req.body);
  // checking if full, if so then show popup
  dumpTable().then(function(result){
    if (result.length + 1 >= 15) {
      // notifies the browser that the database is full
      res.send("pick winner");
    }
    else {
      res.send("continue");
    }
  });

});

//-------------------------------------------

app.get("/getTwoVideos", (req, res) => {
  console.log("getting the two video data");
  getTwoVideos().then(function(result) {
    res.json(result);
    // for debugging purposes
    console.log("Get Two Videos: ", result);
  });
});

app.get("/getWinner", async function(req, res) {
  console.log("getting winner");
  try {
    
    // change parameter to "true" to get it to computer real winner based on PrefTable 
    // with parameter="false", it uses fake preferences data and gets a random result.
    // winner should contain the rowId of the winning video.
    //-----------------------
    let winner = await win.computeWinner(8, false);
    console.log("Winner rowID: ", winner);
    let sqlCommand = "select * from VideoTable where rowIdNum = ?";
    let meep = await db.all(sqlCommand, [winner]);
    res.json(meep);
  
  } catch (err) {
    res.status(500).send(err);
  }
});

// WHAT I ADDED!!!----------------
// responds to the getTwoVideos request and sends back the two distinct random videos
app.get("/getTwoVideos", (req, res) => {
  console.log("getting the two video data");
  getTwoVideos().then(function(result) {
    res.json(result);
    // for debugging purposes
    console.log("Get Two Videos: ", result);
  });
});

// function  to get two distinct random videos and send an array return an array containing their VideoTable data, returns array of two promised objects
async function getTwoVideos() {
  // get two urls from database
  let sqlCommand = "select * from VideoTable order by random() limit 2";
  let result = await db.all(sqlCommand);
  return result;
}

// ---------------------------------

// Page not found
app.use(function(req, res) {
  res.status(404);
  res.type('txt');
  res.send('404 - File ' + req.url + ' not found');
});

// end of pipeline specification

// Now listen for HTTP requests
// it's an event listener on the server!
const listener = app.listen(3000, function() {
  console.log("The static server is listening on port " + listener.address().port);
});

// an async function to insert two videos into the database 

// ============== Insert & Count Video ================ //
async function insertAndCount(vidObj) {
  let rank = [vidObj[0].rowIdNum, vidObj[1].rowIdNum];
  
  try {
    // Gain access to the entire table in sql
    dumpTable()
    .then(function(result) {
      let n = result.length;
      console.log(n + " items in the database");
      console.log("Before: ",result);
      if (n >= 15){
        console.log("Database is full");
        // will edit later --> include pop up
      } else {
        // updateDB();
        console.log("Database is not full, inserting")
        // console.log("This is the ranked array:", rank);
        insertVideo(rank);
        // check PrefTable contents
        dumpTable().then(function(result){
          console.log("After: ",result);
        });
      }
      // return 0;
    })
    .catch(function(err) {
    console.log("SQL error",err)} );
    
  } catch (err) {console.log("ERROR!!!", err);}
}

insertAndCount(vidObj)
    .then(function() {
      console.log("success!");
      
    })
  .catch(function(err) {console.log("DB error!",err)});


// An async function to insert a video into the database
async function insertVideo(data) {
  const sql = "insert into PrefTable (better, worse) values (?,?)";
  await db.run(sql,[data[0], data[1]]);
}

// an async function to get the whole contents of the database 
async function dumpTable() {
  const sql = "select * from PrefTable";
  let result = await db.all(sql);
  return result;
}