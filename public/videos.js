/* Functions for handling tiktok videos */


// Add the blockquote element that tiktok will load the video into the given div
async function addVideo(tiktokurl,divElmt) {
  let videoNumber = tiktokurl.split("video/")[1];

  let block = document.createElement('blockquote');
  block.className = "tiktok-embed";
  block.cite = tiktokurl;
  // have to be formal for attribute with dashes
  block.setAttribute("data-video-id",videoNumber);
  block.style = "width: 325px; height: 563px;"

  let section = document.createElement('section');
  block.appendChild(section);
  
  divElmt.appendChild(block);
}

// Ye olde JSONP trick; to run the script, attach it to the body
function loadTheVideos() {
  body = document.body;
  script = newTikTokScript();
  body.appendChild(script);
}

// makes a script node which loads the TikTok embed script
function newTikTokScript() {
  let script = document.createElement("script");
  script.src = "https://www.tiktok.com/embed.js"
  script.id = "tiktokScript"
  return script;
}

// the reload button action; takes out the blockquote and the scripts, and puts it all back in again.
// the browser thinks it's a new video and reloads it
// the argument i is the index of the video to reload, in case there are two
function reloadVideo (divElmt) {
  
  // get the blockquote in the divElmt
    let block = divElmt.getElementsByClassName("tiktok-embed")[0];
    // and remove it
    console.log("block",block);
    let parent = block.parentNode;
    parent.removeChild(block);

  // remove both the script we put in and the
  // one tiktok adds in
  let script1 = document.getElementById("tiktokScript");
  let script2 = script1.nextElementSibling;

  let body = document.body; 
  body.removeChild(script1);
  body.removeChild(script2);

  addVideo(block.cite, divElmt);
  loadTheVideos();
}



// async function sendGetRequest(url) {
//   let response = await fetch(url, {
//     method: 'GET', 
//     headers: {'Content-Type': 'application/json'}
//   });
//   if (response.ok) {
//     let data = await response.text();
//     return data;
//   } else {
//     throw Error(response.status);
//   }
// }

// sendGetRequest('/getTwoVideos') 
//   .then(function(result) {
//     sessionStorage.clear();
//     sessionStorage.setItem("firstVideo", JSON.parse(result));
//     sessionStorage.setItem("secondVideo", JSON.parse(result));
//     // get the nickname
//     let jsonObject1 = JSON.parse(result);
//     let jsonObject2 = JSON.parse(result);
//     // vidTitle.textContent = jsonObject.nickname;
    
//     addVideo(sessionStorage.getItem("twoVideos"), divElmt);
//     loadTheVideos();
//   })
//   .catch(function(error) {
//      console.error('Error:', error);
//   });