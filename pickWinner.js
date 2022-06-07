'use strict'

/*********** 
This module provides one method, computeWinner(n,testing).
Given preference data in the database PrefTable, it computes pageranks for all the videos, and returns the one with the highest rank.
The argument n is the number of videos in the database.
The argument testing is Boolean.  If true, it does not look for data in PrefTable, but instead makes up random fake preference data to test with.
***************/

module.exports = {
  computeWinner: computeWinner
}


// use Pagerank module, wrap in Promise
let Pagerank = require('pagerank-js');
const util = require('util');
Pagerank = util.promisify(Pagerank);

// Promises-wrapped version of sqlite3
const db = require('./sqlWrap');


// n is number of videos
async function computeWinner(n,testing){
  // get list of videoTable rowIdNums
  let keyList = await getKeyList();
  
  // will contain preference data
  let prefs = [];

  // use fake data if no real data is available, for testing
  if (testing) {
    console.log("making fake preference data for testing");
    prefs = await makeUpFakePreferences(n,2*n,keyList);
  }
    
  // we have real data!
  else {
    prefs = await getAllPrefs();
  }


// translate into input format that pagerank code wants
let nodes = makeDirectedGraph(prefs,n,keyList);

// standard values; might need to change?
let linkProb = 0.85 // high numbers are more stable
let tolerance = 0.0001 // accuracy of convergence. 

// run pagerank code
let results = await Pagerank(nodes, linkProb, tolerance);
// console.log("Pagerank results",results);
// get index of max element
let i = results.indexOf(Math.max(...results));

console.log("winner",i,"rowIdNum",keyList[i]);
// translate result back to rowId numbers
return keyList[i];
}


function makeDirectedGraph(prefs,n,keyList) {

// put all the preferences into a dictionary where keys are video indices
  // and values are all better ones
  let graph = {};

  for (let i=0; i<keyList.length; i++) {
    graph[keyList[i]] = [];
  }

  for (let i=0; i<prefs.length; i++) {
    let b = prefs[i].better;
    let w = prefs[i].worse;
    graph[w].push(b);
  }

  // rename keys so they form a list from 0 to n, where n=number of videos
  let translate = {};
  for (let i=0; i<keyList.length; i++) {
    translate[keyList[i]] = i;
  }
  

  // output adjacencey list, where the new name of a node is it's index in the adjacency list
  const adjList = [];
  for (let i=0; i<keyList.length; i++) {
    let key = keyList[i];
    let outgoing = graph[key];
    // translate names of nodes in outgoing edges

    let newoutgoing = outgoing.map(function (x) {
      return translate[x];
    });
    adjList.push(newoutgoing);
  }
  return adjList;
}

// make up fake preferences data for testing
// n is number of videos, p is number of preferences to try to invent
async function makeUpFakePreferences (n,p,keyList) {
  
  
  let prefs = []; // will be array of objects
  for (let i=0; i<p; i++) {
    let a = keyList[getRandomInt(n)];
    let b = keyList[getRandomInt(n)];
    if (a != b) {
      // add an object to array
      prefs.push({
        id: i,
        better: a,
        worse: b
      });
    } //if 
  } //for
  return prefs;
}

// random integer generator
// returns an integer between zero and max-1
function getRandomInt(max) {
  let n = Math.floor(Math.random() * max);
  // console.log(n);
  return n;
}


/* database operations */

async function getKeyList () {
  let cmd = "SELECT rowIdNum FROM VideoTable;"
  let keyObjList = await db.all(cmd);
  let keyList = [];
  for (let i=0; i<keyObjList.length; i++)   {
    keyList.push(keyObjList[i].rowIdNum);
  }
  return keyList;
}

// gets preferences out of preference table
async function getAllPrefs() {
  const dumpCmd = "SELECT * from PrefTable";
  
  try {
    let prefs = await db.all(dumpCmd);
    return prefs;
  } catch(err) {
    console.log("pref dump error", err);
  }
}

// gets preferences out of preference table
async function getAllVideos() {
  const dumpCmd = "SELECT * from VideoTable";
  
  try {
    let videos = await db.all(dumpCmd);
    return videos;
  } catch(err) {
    console.log("video dump error", err);
  }
}



// inserts a preference into the database
async function insertPreference(i,j) {

  // SQL command we'll need
const insertCmd = "INSERT INTO PrefTable (better,worse) values (?, ?)";
  
   try {
    await db.run(insertCmd, [i,j]);
  } catch(error) {
    console.log("pref insert error", error);
  }
}