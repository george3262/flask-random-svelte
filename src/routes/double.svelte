<script>
let inputNumber = 0;
let result = null;

async function doubleNumber() {
    try {
    const response = await fetch('https://flask-production-8d81.up.railway.app/double', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: inputNumber }),
    });

    if (response.ok) {
        const data = await response.json();
        result = data.result;
    } else {
        result = null;
    }
    } catch (error) {
    console.error('Error:', error);
    result = null;
    }
}
</script>

<h1>Test Flask API</h1>
<input type="number" bind:value={inputNumber} />
<button on:click={doubleNumber}>Submit</button>
<p>{inputNumber}</p>


{#if result !== null}
<p>Result: {result}</p>
{/if}
