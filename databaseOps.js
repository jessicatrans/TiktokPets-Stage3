'use strict'

// database operations.
// Async operations can always fail, so these are all wrapped in try-catch blocks
// so that they will always return something
// that the calling function can use. 

// Export functions that will be used in other files.
module.exports = {
  post_video: post_video,
  // get_video: get_video,
  delete_video: delete_video,
  get_most_recent: get_most_recent,
  get_all: get_all,
  update_video: update_video,
  get_num_videos: get_num_videos,
}

// using a Promises-wrapped version of sqlite3
const db = require('./sqlWrap');

// SQL commands for PrefTable
const insertVideo = "INSERT INTO PrefTable (url, nickname, userid, flag) values (?, ?, ?, ?)";
// const getVideo = "SELECT * FROM PrefTable WHERE "
const getAllVideos = "SELECT * FROM PrefTable";
const updateVideo = "UPDATE PrefTable SET flag = 0 WHERE flag = 1";
const getNumVideos = "SELECT COUNT(*) FROM PrefTable";
const getMostRecent = "SELECT * FROM PrefTable WHERE flag = 1";
const deleteVideo = "DELETE FROM PrefTable WHERE nickname = ?";

// async function post_video(url, nickname, userid) {
//   try {
//     await db.run(insertVideo, [url, nickname, userid, 1]);
//   } catch(error) {
//     console.log("error", error);
//   }
// }

async function post_video(data) {
  try {
    await db.run(insertVideo, [data.URL, data.nickname, data.username, 1]);
  } catch(error) {
    console.log("error", error);
  }
}

async function update_video() {
  try {
    await db.run(updateVideo, []);
  } catch(error) {
    console.log("error", error);
  }
}

async function get_num_videos() {
  try {
    let result = await db.get(getNumVideos, []);
    // selecting property of object result, named 'COUNT(*)'
    return (result != null) ? result['COUNT(*)'] : null;
  } catch(error) {
    console.log("error", error);
    return 0;
  }
}

async function get_all() {
  try {
    let results = await db.all(getAllVideos, []);
    return results;
  } catch (error) {
    console.log("error", error);
    return [];
  }
}

async function get_most_recent() {
  try {
    let result = await db.get(getMostRecent, []);
    return result;
  } catch(error) {
    console.log("error", error);
    return {};
  }
}

async function delete_video(nickname) {
  try {
    await db.run(deleteVideo, [nickname]);
  } catch(error) {
    console.log("error", error);
  }
}