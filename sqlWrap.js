/* Wraps sqlite commands get,use, and all, so that they use Promises, and can be used with async-await */

/* Also creates the database; you will need to configure it here */

'use strict'

const sql = require('sqlite3');
const util = require('util');

// new database object. Opens existing database if there is one.
const db = new sql.Database("videos.db");

// wrap all database commands in promises
db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);




// initialize database tables if necessary
initTables()
  .catch(function(err) {
    console.log("database table creation error", err);
  });

async function initTables () {
  
  let result1 =  await checkIfThere("VideoTable");
  if (!result1) {
    console.log("Creating video table");
    await createVideoTable();
  }

  let result2 = await checkIfThere("PrefTable");
  if (!result2) {
    console.log("Creating preferences table");
    await createPrefTable();
  } else {
    // clean out any old data
    await deleteEverythingPrefs();
  }
}


async function checkIfThere(table) {
console.log("checking for",table);
// make the SQL command
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name = ? ";
let result = await db.get(cmd,[table]);
if (result == undefined) { return false;} 
else { return true; }
}


// called to create table if needed
async function createVideoTable() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
const cmd = 'CREATE TABLE VideoTable (rowIdNum INTEGER PRIMARY KEY, url TEXT, nickname TEXT, userid TEXT, flag INTEGER)';
  
await db.run(cmd);
console.log("made VideoTable");
// error will be caught in initTables
}

async function createPrefTable() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
const cmd = 'CREATE TABLE PrefTable (rowIdNum INTEGER PRIMARY KEY, better INTEGER, worse INTEGER)';
  
await db.run(cmd);
console.log("made PrefTable");
// error will be caught in initTables
}

// empty all data from PrefTable
async function deleteEverythingPrefs () {
  await db.run("delete from PrefTable");
  // vacuum is an SQL command, kind of garbage collection
  await db.run("vacuum");
}

// allow code in other server .js files to use the db object
module.exports = db;
