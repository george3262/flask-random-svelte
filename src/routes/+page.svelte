<script>
    import { AppShell } from '@skeletonlabs/skeleton';
    import { searchActsInput, searchHansardsInput, passActContent } from './store'

    let inputText = "";

    function searchActs() {
        if (inputText !== "") {
            searchActsInput.set(inputText);
            passActContent.set({});
        }
    };

    function searchHansards() {
        if (inputText !== "") {
            searchHansardsInput.set(inputText);
            passActContent.set({});
        }
    };
</script>

<AppShell>
    <div class="vertical-center">
        <div class="container mx-auto mt-10 mb-6 px-5">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <textarea bind:value={inputText} 
                    class="textarea p-3 border border-primary-500" rows="1" 
                    placeholder="search" 
                    style="width: 70%; min-width: 450px;"></textarea>
                <div class="button-container">
                    <button class="btn btn-lg variant-filled-secondary m-3" 
                        on:click={searchActs}
                        {inputText === "" ? 'disabled' : ''}>
                        <a href="/acts/search">Search Acts</a>
                    </button>
                    <button class="btn btn-lg variant-filled-secondary m-3" 
                        on:click={searchHansards}
                        {inputText === "" ? 'disabled' : ''}>
                        <a href="/hansards">Search Hansards</a>
                    </button>
                </div>
            </div>
        </div>
    </div>
</AppShell>

<style>
    /* Style to center content vertically and move it down by 30% */
    .vertical-center {
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Move content to the top of the viewport */
    align-items: center;
    height: 10vh; /* Full viewport height */
}
    /* Add margin-top to push content down by 30% */
    .container {
      margin-top: 20vh; /* 30% of viewport height */
    }
</style>