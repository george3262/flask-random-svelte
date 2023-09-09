<script>
import { onMount } from 'svelte';
let data = null;
let buttonClicks = 0;

// Function to fetch JSON data from the Flask API and update data and buttonClicks
async function fetchRandomData() {
    try {
    const response = await fetch('https://flask-production-8d81.up.railway.app/random');
    if (response.ok) {
        data = await response.json();
        buttonClicks++; // Increment the button click counter
    } else {
        console.error('Failed to fetch JSON data');
    }
    } catch (error) {
    console.error('Error fetching JSON data:', error);
    }
}
onMount(fetchRandomData);
</script>

<main>
<h1>Random Number:</h1>
{#if data}
    <p>random number: {data.random_number}</p>
    <p>calc number: {data.random_number * data.random_number}</p>
{:else}
    <p>Loading random number...</p>
{/if}

<p>Button Clicks: {buttonClicks}</p>

<button on:click={fetchRandomData}>Get New Random Number</button>
</main>
