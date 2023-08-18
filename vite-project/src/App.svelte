<script>
  let resultsBag;
  async function scrape() {
    let result;
      try{
         result = await fetch(`http://localhost:3000/scrape`);
         console.log(await result.json());
      }
      catch(err) {
        console.log(err);
      }
  }


  scrape();
</script>

<main class="flx(column) center middle">
  <h1>BNHA Smash or Pass</h1>
  <div class="flx(column) center middle">
    <div sidebar></div>
    <div character></div>
    <div >
      <img src="https://static.wikia.nocookie.net/bokunoheroacademia/images/2/2f/Mr._Principal_Anime_Portrait.png/revision/latest/scale-to-width-down/135?cb=20200401120805" alt="lol">
    </div>
  
</main>

<style>
  
</style>