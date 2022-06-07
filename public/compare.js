let videoElmts = document.getElementsByClassName("tiktokDiv");

let reloadButtons = document.getElementsByClassName("reload");
let heartButtons = document.querySelectorAll("div.heart");

let nickname1 = document.getElementById("nickname1");
let nickname2 = document.getElementById("nickname2");


// WHAT I ADDED!! -------
let button = document.getElementById("next");
button.addEventListener("click", nextButtonPress);

let videoData;



for (let i = 0; i < 2; i++) {
  reloadButtons[i].addEventListener("click", function() {reloadVideo(videoElmts[i])});
  heartButtons[i].classList.add("unloved");
  heartButtons[i].addEventListener("click", function(){changeHeart(i)});

}

// given function that sends a post request
async function sendPostRequest(url,data) {
  params = {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data) };
  console.log("about to send post request");
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.text();
    return data;
  } else {
    throw Error(response.status);
  }
}

function nextButtonPress() {
  // window.location = "./winner.html";
  // console.log("Videossss: ", videoData);
  let data = [];
  

  if (heartButtons[1].classList.contains("loved")) { // heart 2
    // update preference in json
    data[0] = videoData[1];
    data[1] = videoData[0];
    // console.log("Updated Preference for Vid: ", data);
  } else {
    data[0] = videoData[0];
    data[1] = videoData[1];
  }
  console.log("Updated Preference for Vid: ", data);

  
  sendPostRequest("/insertPref", data)
  .then(function(res) {
    console.log("Response received: ", res);
    if ((heartButtons[0].classList.contains("loved") && heartButtons[1].classList.contains("unloved")) || (heartButtons[1].classList.contains("loved") && heartButtons[0].classList.contains("unloved"))) { 
      if (res == "continue") {
        window.location = "compare.html";
        // console.log("I got: ", res);
      } else {
        window.location = "winner.html";
      }
    }
  })
  .catch(function(err){
    console.log("POST request error", err);
  })   
}

// get two videos
async function getVids() {
  console.log("Getting vids...");
  let twoVideosRes = await fetch("/getTwoVideos");
  let twoVideosData = await twoVideosRes.json();
  videoData = twoVideosData;
  let firstVideo = twoVideosData[0].url;
  let secondVideo = twoVideosData[1].url;

  nickname1.textContent = twoVideosData[0].nickname;
  nickname2.textContent = twoVideosData[1].nickname;

  

  
  // console.log("This is the video data: ", twoVideosData[0]);
  // console.log("First video: ", firstVideo);
  // console.log("Second video: ", secondVideo);
  
  addVideo(firstVideo, videoElmts[0]);
  loadTheVideos();
  addVideo(secondVideo, videoElmts[1]);
  loadTheVideos();
}

getVids();
// updatePref();


// update heart icon
function changeHeart(i) {
  let dot = document.querySelectorAll('.dot');
  let temp;

  // changes heart
  if (heartButtons[i].classList.contains("loved")) {
    heartButtons[i].classList.remove("loved");
    heartButtons[i].classList.add("unloved");
  } else {
    heartButtons[i].classList.remove("unloved");
    heartButtons[i].classList.add("loved");
  }
  temp = dot[i].getAttribute('data-prefix') === 'far' ? 'fas' : 'far';
  dot[i].setAttribute('data-prefix', temp);
  
  // make sure that only one heart is filled
  if (heartButtons[0].classList.contains("loved") && heartButtons[1].classList.contains("loved")) {
    if (i == 0) { // user clicked heart1
      // make heart2 empty (far)
      heartButtons[1].classList.remove("loved");
      heartButtons[1].classList.add("unloved");
      temp = dot[1].getAttribute('data-prefix') === 'far' ? 'fas' : 'far';
      dot[1].setAttribute('data-prefix', temp);
    } else { // user clicked heart2
      // make heart1 empty (far)
      heartButtons[0].classList.remove("loved");
      heartButtons[0].classList.add("unloved");
      temp = dot[0].getAttribute('data-prefix') === 'far' ? 'fas' : 'far';
      dot[0].setAttribute('data-prefix', temp);
    }
  }
}



//--------------------------------


// hard-code videos for now
// You will need to get pairs of videos from the server to play the game.
// const urls = ["https://www.tiktok.com/@berdievgabinii/video/7040757252332047662",
// "https://www.tiktok.com/@catcatbiubiubiu/video/6990180291545468166"];

// for (let i=0; i<2; i++) {
//       addVideo(urls[i],videoElmts[i]);
//     }
//     // load the videos after the names are pasted in! 
//     loadTheVideos();