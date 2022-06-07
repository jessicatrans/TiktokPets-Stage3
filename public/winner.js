// when this page is opened, get the most recently added video and show it.
// function is defined in video.js
let divElmt = document.getElementById("tiktokDiv");
let nickname = document.getElementById("nickname");

let reloadButton = document.getElementById("reload");
// set up button to reload video in "tiktokDiv"
reloadButton.addEventListener("click",function () {
  reloadVideo(tiktokDiv);
});



// always shows the same hard-coded video.  You'll need to get the server to 
// compute the winner, by sending a 
// GET request to /getWinner,
// and send the result back in the HTTP response.

showWinningVid();
async function getVids() {
  console.log("Getting vids...");
  let twoVideosRes = await fetch("/getTwoVideos");
  let twoVideosData = await twoVideosRes.json();
  videoData = twoVideosData;
  let firstVideo = twoVideosData[0].url;
  let secondVideo = twoVideosData[1].url;
  // console.log("This is the video data: ", twoVideosData[0]);
  // console.log("First video: ", firstVideo);
  // console.log("Second video: ", secondVideo);
  addVideo(firstVideo, videoElmts[0]);
  loadTheVideos();
  addVideo(secondVideo, videoElmts[1]);
  loadTheVideos();
}
async function showWinningVid() {
  console.log("Getting winning video...");
  let vidRes = await fetch("/getWinner");
  let vidData = await vidRes.json();
  let url = vidData[0].url;

  console.log("This is the winner: ", vidData);
  console.log("This is the url: ", url);
  console.log("This is the nickname: ", vidData[0].nickname);

  nickname.textContent = vidData[0].nickname;
  addVideo(url, divElmt);
  loadTheVideos();
}


// showWinningVideo()

// function showWinningVideo() {
  
//   let winningUrl = "https://www.tiktok.com/@catcatbiubiubiu/video/6990180291545468166";
//   addVideo(winningUrl, divElmt);
//   loadTheVideos();
// }
