<script>
	export let userPref;
	export let characterPageUrl;
	export let characterImageUrl;
	export let characterName;
	export let femalePrefPass;
	export let malePrefPass;
	export let noPrefPass;
	export let femalePrefSmash;
	export let malePrefSmash;
	export let noPrefSmash;

	import Chart from './PieChart.svelte';
	import { onMount} from 'svelte';

	let preferenceSwitch = ['male ♂️','female ♀️','both ⚥'];
	let selectedPreference;

	function selectPreference(preference) {
		if (preferenceSwitch.indexOf(preference) !== -1) {
			selectedPreference = preference;
		}
	}
	function calculatePercentSmash(smashed, passed) {
		const total = passed + smashed;
		return (smashed / total)*100;
	}
	function calculatePercentPass(passed, smashed) {
		const total = passed + smashed;
		return (passed / total)*100;
	}
	selectPreference(userPref);
	
</script>

<div class="flx(column)" style="margin-bottom: 2rem;">
	
	<div style="z-index: 2;"class="flx(wrap) middle space-between">
		<button on:click={()=> selectPreference('female ♀️')} class:is-info={selectedPreference == 'female ♀️'} class="emoji btn(large)">♀️</button>
		<button on:click={()=> selectPreference('male ♂️')} class:is-info={selectedPreference == 'male ♂️'} class="emoji btn(large)">♂️</button>
		<button on:click={()=> selectPreference('both ⚥')} class:is-info={selectedPreference == 'both ⚥'} class="emoji btn(large)">⚥</button>
	</div>

	{#if selectedPreference == 'female ♀️'}
		<div style="position: relative;">
		<a href={characterPageUrl} target="_blank">
			<img src={characterImageUrl} width="225" height="225" alt={characterName}></a>
		
		<Chart smashData={femalePrefSmash} passData={femalePrefPass}/>
		<h4>{characterName}</h4>

		<p>Smashed: {calculatePercentSmash(femalePrefSmash,femalePrefPass)}% Passed: {calculatePercentPass(femalePrefPass,femalePrefSmash)}%</p>
		</div>
	{/if}
	{#if selectedPreference == 'male ♂️'}
		<div style="position: relative;">
		<a href={characterPageUrl} target="_blank"><img src={characterImageUrl} width="225" height="225" alt={characterImageUrl}></a>
		
		<Chart smashData={malePrefSmash} passData={malePrefPass}/>
		<h4>{characterName}</h4>

		<p>Smashed: {calculatePercentSmash(malePrefSmash,malePrefPass)}% Passed: {calculatePercentPass(malePrefPass,malePrefSmash)}%</p>
		</div>
	{/if}
	{#if selectedPreference == 'both ⚥'}
		<div style="position: relative;">
		<a href={characterPageUrl} target="_blank"><img src={characterImageUrl} width="225" height="225" alt={characterImageUrl}></a>
		
		<Chart smashData={noPrefSmash} passData={noPrefPass}/>
		<h4>{characterName}</h4>

		<p>Smashed: {calculatePercentSmash(noPrefSmash,noPrefPass)}% Passed: {calculatePercentPass(noPrefPass,noPrefSmash)}%</p>
		</div>
	{/if}
</div>

<style>
	button {
		box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
	}
	.emoji {
		font-size: 1.5rem;
	}
	img {
		border-radius: 100%;
		border:black 8px solid;
	}
	a {
		position: absolute;
		top: 2.85rem;
		left: 1.8rem;
	}
</style>