<script>
	export let data;
	export let userPref;

	import CharacterAnalytics from './lib/CharacterAnalytics.svelte';
	import { onMount } from 'svelte';

	let PAGE_LENGTH = 20;
	let docs = [];
	let loadingNextPage = false;
	let currentOffset = 0;

	let genderOptions = ['male ♂️','female ♀️','both ⚥'];
		

	async function calculate(data){
		//first create smashed and passed calculated data.
		//this actually mutates the exported data variable, which is really interesting...
		data.map((character)=>{
			if (character.smashed) {
				character.femalePrefSmash = character.smashed.filter(i => i.sexualPreference == 'female').length;
				character.malePrefSmash = character.smashed.filter(i => i.sexualPreference == 'male').length;
				character.noPrefSmash = character.smashed.filter(i => i.sexualPreference == 'both').length;
			}
			if (character.passed) {
				character.femalePrefPass = character.passed.filter(i => i.sexualPreference == 'female').length;
				character.malePrefPass = character.passed.filter(i => i.sexualPreference == 'male').length;
				character.noPrefPass = character.passed.filter(i => i.sexualPreference == 'both').length;
			}
		});
		
		console.log('done!',data.length);
	}

	function start(offset) {
		docs = data.slice(0, offset + PAGE_LENGTH);
	}

	function handleScroll() {
	// only allow the loading of new data if it is not already loading new data
	if (!loadingNextPage && (window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
		const previousScrollY = window.scrollY;
		loadingNextPage = true;
		setTimeout(() => {
			window.scroll(0, previousScrollY);
			currentOffset += PAGE_LENGTH;
			start(currentOffset);
			loadingNextPage = false;
		})}
	}

	
	// console.log(data);
	onMount(async() => {
		await calculate(data);
		start(0);
		console.log('the component has mounted');
	});
</script>

<svelte:window on:scroll={handleScroll} />
<div>
	<div class="">
		<h4>By Preferred Sex:</h4>
		
			{#if genderOptions.indexOf(userPref) !== -1}
				{#each docs as character}
					<CharacterAnalytics 
						userPref={userPref}
						characterPageUrl={character.page} 
						characterImageUrl={character.url} 
						characterName={character.name}
						femalePrefPass={character.femalePrefPass}
						malePrefPass={character.malePrefPass}
						noPrefPass={character.noPrefPass} 
						femalePrefSmash={character.femalePrefSmash}
						malePrefSmash={character.malePrefSmash}
						noPrefSmash={character.noPrefSmash}
					/>
				{/each}
			{:else}
			no user preference set?
			{/if}
	</div>
</div>

<style>
	
</style>

