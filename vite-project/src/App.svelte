<script>
import { onMount } from 'svelte';


let resultsBag;
let characterDataArray = [];
let currentIndex = 0;
let currentUrl = '';
let currentName = '';
let smashed = [];
let passed = [];
let picsLeft;

//local anayltics
let startTime = Date.now();
let interval;
let elapsedTime;
//timer for individual pics
let picTime = Date.now();
let picInterval;
let elapsedPicTime;

let passedTimes = [];
let smashedTimes = [];

let longestPass;
let longestSmash;

async function scrape() {
  let result;
    try{
       result = await fetch(`http://localhost:3000/scrape`);
       resultsBag = await result.json();
       console.log(resultsBag.response);
    }
    catch(err) {
      console.log(err);
    }
    if (resultsBag.response) {
      resultsBag = resultsBag.response;
      characterDataArray = shuffleArray(resultsBag).map((data)=> {
        data.textContent
        const srcAttributeRegex = /src="(https:\/\/.*?\.png).*?"/;
        const match = data.textContent.match(srcAttributeRegex);

        if (match) {
          const srcAttributeValue = match[1]; // Captured portion of the URL
          console.log(srcAttributeValue);
          data.url = srcAttributeValue;
          return data;
        } else {
          console.log('src attribute not found.');
        }
      });

      //after parsing url its time to search for duplicates and remove them
      let uniquePictures = [];
      let filteredArray = [];

      for (let obj of characterDataArray) {
          console.log(uniquePictures);
          if (obj && Object.hasOwn(obj, 'url')) {
            if (!uniquePictures.includes(obj.url)) {
              uniquePictures = [...uniquePictures, obj.url];
              filteredArray = [...filteredArray, obj];
            }
          }
          
      }
      console.log('unique:',uniquePictures);
      console.log('filterd:', filteredArray);
      characterDataArray = filteredArray;


      console.log(characterDataArray[currentIndex]);
      currentUrl = characterDataArray[currentIndex].url;
      currentName = characterDataArray[currentIndex].innerText;
      picsLeft = characterDataArray.length;
    }
    console.log(characterDataArray[0].url);
    

}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Generate a random index between 0 and i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at positions i and j
  }
  return array;
}
//========================all calculations============================================//
function calcPicsLeft() {
  picsLeft = characterDataArray.length - currentIndex;
  console.log(picsLeft);
}
 // Update the timer every second
function updateTotalTimer() {
  const currentTime = Date.now();
  elapsedTime = Math.floor((currentTime - startTime) / 1000);
}
function updatePicTimer() {
  const currentTime = Date.now();
  elapsedPicTime = Math.floor((currentTime - picTime) / 1000);
}

function calcAverageTimePerPic() {
  let allTimes = [...smashedTimes.map((i)=> i.time),...passedTimes.map((i)=> i.time)];
  let sum = allTimes.reduce((total, num) => total + num, 0);
  return sum / allTimes.length;
}
function calcLongestSmash() {
  const highest = Math.max(...smashedTimes.map((i)=> i.time))
  let result = smashedTimes.filter((i) => {
    if (i.time == highest) {
      return i;
    }
  });

  longestSmash = result[0];
  console.log(longestSmash);
}
function calcLongestPass() {
  const highest = Math.max(...passedTimes.map((i)=> i.time));
  let result = passedTimes.filter((i) => {
    if (i.time == highest) {
      return i;
    }
  });

  longestPass = result[0];
  console.log(longestPass);
}   
//=================================end of calculations=================================//
function pass(name,url) {
  calcPicsLeft();
  clearInterval(picInterval);
  passedTimes = [...passedTimes,{time:elapsedPicTime,name:name,url:url}];
  
  passed = [...passed,{name:name,url:url}]
  console.log(passed)
  currentIndex++;
  if (currentIndex == characterDataArray.length) {
    clearInterval(interval);
    console.log(passedTimes);
    console.log(smashedTimes);
    console.log(elapsedPicTime);
    calcLongestSmash();
    calcLongestPass();
    return;
  }
  console.log('index',currentIndex);
  currentUrl = characterDataArray[currentIndex].url;
  currentName = characterDataArray[currentIndex].innerText;
  resetPicTimer();
}
function smash(name,url) {
  calcPicsLeft();
  clearInterval(picInterval);
  smashedTimes = [...smashedTimes, {time:elapsedPicTime,name:name,url:url}];
  
  smashed = [...smashed,{name:name,url:url}]
  console.log(passed)
  currentIndex++;
  if (currentIndex == characterDataArray.length) {
    clearInterval(interval);
    console.log(passedTimes);
    console.log(smashedTimes);
    console.log(elapsedPicTime);
    calcLongestSmash();
    calcLongestPass();
    return;
  }
  console.log('index',currentIndex);
  currentUrl = characterDataArray[currentIndex].url;
  currentName = characterDataArray[currentIndex].innerText;
  resetPicTimer();
}
//================================tooltip stuff==============================================//
// Function to update image position on scroll and resize
function updateImagePosition(image) {
    const imageRect = image.getBoundingClientRect();
    const containerRect = imageContainer.getBoundingClientRect();

    // Calculate the image's position relative to the container
    const relativeLeft = imageRect.left - containerRect.left;
    const relativeTop = imageRect.top - containerRect.top;

    console.log('Image position (relative to container):', relativeLeft, relativeTop);
}
const images = document.querySelectorAll('.image');

function showTooltip(e,position = 'left') {
    console.log(e);
    const positions = ['left','right'];
    if (position.indexOf(position) == -1) {
      console.error(`only 'left' or 'right' are supported.`)
      return;
    }
    const imageRect = e.target.getBoundingClientRect();
    const tooltip = e.target.nextElementSibling;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    console.log(tooltipHeight);
    console.log("tooltipWidth:",tooltipWidth)
    if (position == 'left') {
      tooltip.style.left = `${imageRect.left - tooltipWidth}px`;
      tooltip.style.top = `${imageRect.top - tooltipHeight + 50}px`;
    }
    if (position == 'right') {
      tooltip.style.borderRadius = `5px 25px 25px 5px`;
      tooltip.style.left = `${imageRect.left + 50}px`;
      tooltip.style.top = `${imageRect.top - tooltipHeight + 50}px`;
    }
    
    tooltip.classList.remove('hidden');
    console.log(tooltip);
}

function hideTooltip(e) {
  const tooltip = e.target.nextElementSibling;
  tooltip.classList.add('hidden');
}
//================================tooltip stuff==============================================//
function resetPicTimer() {
  picTime = Date.now();
  picInterval = setInterval(updatePicTimer,1000);
}
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes} min(s) and ${remainingSeconds} sec(s)`;
}


onMount(() => {
    console.log('the component has mounted');
    scrape();
    // Start the timer on page load
    interval = setInterval(updateTotalTimer, 1000);
    picInterval = setInterval(updatePicTimer, 100);
});
  
</script>

<main class="flx(column) center middle">
  <h1 style="text-align: center;">Boku No Hero Smash or Pass</h1>
  
  <div class="flx(wrap) space-around top is-full">
    <div class="sidebar flx(column) col-center is-1">
      <h4>passed</h4>
      {#if passed.length }
        {#each passed as item}
          <div>
              <img class="img" 
                on:mouseenter={(e) => showTooltip(e,'right')} on:mouseleave={(e) => hideTooltip(e,'right')}
                src={item.url} alt={item.name} width="50" height="50">

              <div class="hidden tooltip" style="">
                {item.name}
              </div>
        </div>
        {/each}
      {/if}
    </div>

    <div class="flx(column) center middle">
      {#if currentIndex != characterDataArray.length}
      <div id='character' class="flx(column) center middle">
        <h4>{currentIndex +'/'+ characterDataArray.length}</h4>
        <img src={currentUrl} alt="alt" width="100%" />
        <h3>{currentName}</h3>
      </div>
      {/if}
      <div id="smashpass" class="flx(wrap) space-around middle is-full">
        {#if currentIndex != characterDataArray.length}
        
        <button style="margin-right:2rem; padding: .2rem 2rem;" on:click={() => pass(currentName,currentUrl)} class="btn(xlarge) is-error is-round">
          Pass
        </button>
        <button style="padding: .2rem 1rem;"  on:click={() => smash(currentName,currentUrl)} class="btn(xlarge) is-success is-round">
          Smash
        </button>
        {:else}
        <div class="flx(column) center middle" style="max-width:20rem; text-align:center;">
          <h2>Finished!</h2>
          <h4>Stats:</h4>
          
            <p><b>Total Time Taken:</b> {formatTime(elapsedTime)}</p>
            <p><b>Longest Smashed Pic:</b> </p>
            <p>{formatTime(Math.max(...smashedTimes.map((i)=> i.time)))}</p>
            <div class="flx(column) center middle" style="margin-bottom: 3rem;">
              {#if longestSmash}
              <img src={longestSmash.url} alt="longestSmashed" width="100" height="100">
              <span><b>{longestSmash.name}</b></span>
              <span class="emoji">😏</span>
              <p>You took a good long look at this one.</p>
              {/if}
            </div>
            <hr />
            <p><b>longest passed pic:</b> </p>
            <p>{formatTime(Math.max(...passedTimes.map((i)=> i.time)))}</p>
            <div class="flx(column) center middle" style="margin-bottom: 3rem;">
              {#if longestPass}
              <img src={longestPass.url} alt="longestPassed" width="100" height="100">
              <span><b>{longestPass.name}</b></span>
              <span class="emoji">🤔</span>
              <p>Really not sure if you wanted to smash this one or not huh?</p>
              {/if}
            </div>
            <hr />
            <p> <b>average time per pic:</b> </p>
            <p>{formatTime(calcAverageTimePerPic())}</p>

          
        </div>
        {/if}
      </div>
      
    </div>
    
    
    
    <div class="sidebar flx(column) col-center is-1">
    <h4>smashed</h4>
    {#if smashed.length }
      {#each smashed as item}
        
        <div>
          
              <img class="img" 
                on:mouseenter={(e) => showTooltip(e)} on:mouseleave={(e) => hideTooltip(e)}
                src={item.url} alt={item.name} width="50" height="50">

              <div class="hidden tooltip">
                {item.name}
              </div>
        </div>
        
      {/each}
    {/if}
    </div>
</main>

<style>
  .sidebar {
    height: 40em;
    overflow-y: scroll;
  }
  .hidden {
    
    visibility: hidden;
  }
  .tooltip {
    position: fixed;
    background-color:rgba(0, 0, 0, 0.75); 
    color:white;
    padding:12px;
    font-family: 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell,
      'Helvetica Neue', sans-serif;
    font-style: bold;
    border-radius: 25px 5px 5px 25px;
    max-width: 13em;
    line-height: 1.25rem;

  }
  .emoji {
    font-size: 4rem;
  }
  span {
    max-width: 14rem;
    text-align: center;
  }
</style>