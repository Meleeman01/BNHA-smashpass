<script>
  let resultsBag;
  let characterDataArray = [];
  let currentIndex = 0;
  let currentUrl = '';
  let currentName = '';
  let smashed = [];
  let passed = [];
  let picsLeft;

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
        characterDataArray = characterDataArray.slice(0,7);
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

  function calcPicsLeft() {
    picsLeft = characterDataArray.length - currentIndex;
    console.log(picsLeft);
  }
  

  function pass(name,url) {
    calcPicsLeft();
    if (picsLeft == 0) {
      return;
    }
    passed = [...passed,{name:name,url:url}]
    console.log(passed)
    currentIndex++;
    currentUrl = characterDataArray[currentIndex].url;
    currentName = characterDataArray[currentIndex].innerText;
    
  }
  function smash(name,url) {
    calcPicsLeft();
    if (picsLeft == 0) {
      return;
    }
    smashed = [...smashed,{name:name,url:url}]
    console.log(passed)
    currentIndex++;
    currentUrl = characterDataArray[currentIndex].url;
    currentName = characterDataArray[currentIndex].innerText;
    
  }



  scrape();
</script>

<main class="flx(column) center middle">
  <h1>BNHA Smash or Pass</h1>
  
  <div class="flx(wrap) space-between top is-full">
    <div id="sidebar">
      <h4>passed</h4>
      {#if passed.length }
        {#each passed as item}
          <div class="mouseover">
            <img src={item.url} alt={item.name} width="50" height="50">
          </div>
        {/each}
      {/if}
    </div>

    <div class="flx(column) center middle">
      <div id='character' class="flx(column) center middle">
        <h4>{currentIndex +'/'+ characterDataArray.length}</h4>
        <img src={currentUrl} alt="alt" width="100%" />
        <h3>{currentName}</h3>
      </div>
      <div id="smashpass" class="flx(wrap) space-between middle is-full">
        {#if currentIndex != characterDataArray.length}
        <button on:click={() => smash(currentName,currentUrl)} class="btn(xlarge) is-success">
          smash
        </button>
        <button on:click={() => pass(currentName,currentUrl)} class="btn(xlarge) is-error">
          pass
        </button>
        {:else}
        <div>Finished!</div>
        {/if}
      </div>
      
    </div>
    
    
    
    <div id="sidebar">
    <h4>smashed</h4>
    {#if smashed.length }
      {#each smashed as item}
        <div>
          <img src={item.url} alt={item.name} width="50" height="50">
        </div>
      {/each}
    {/if}
    </div>
</main>

<style>
  .mouseover:hover {
    
  }
</style>