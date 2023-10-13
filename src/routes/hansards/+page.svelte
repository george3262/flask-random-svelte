    <script>
    import { supabase } from '../../lib/supabase';
    import { ProgressRadial } from '@skeletonlabs/skeleton';
    import { AppShell } from '@skeletonlabs/skeleton';
    import { passActContent, hocContent, senContent, searchHansardsInput, searchHansardsInputCurrent } from "../store.js"
    import { onMount } from 'svelte';
    import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

    let check_results = null;
    let hoc_results = null;
    let sen_results = null;
    let bill_results = null;
    let error = null;
    let isLoading = false;
    let isLoading_check = false;
    let selectedContent;
    let selectedBillstoSearch = [];
    let selectedHocSenCom = 'HOC';
    let searchAllBills = true;
    let showBillInfo = false;
    let inputText = "";
    let currentInputText = "";
    let recommendedBills = null;

    function filter(item) {
        recommendedBills[item].selected = !recommendedBills[item].selected;
    }

    $: {if (selectedBillstoSearch.length > 0) {
        searchAllBills = false;
    }}
    $: {if (selectedBillstoSearch.length == 0) {
        searchAllBills = true;
    }}

    function toggleBillInfo(){
        showBillInfo = !showBillInfo;
    }

    function toggleSearchAllBills(){
        recommendedBills = bill_results.reduce((acc, item) => {
                const parliamentKey = item['metadata']['parliament'];
                const text = item['metadata']['text'];
                acc[parliamentKey] = { selected: false, text: text };
                return acc;
                }, {});
    }

    searchHansardsInput.subscribe((value) => {
        inputText = value;
        });
    searchHansardsInputCurrent.subscribe((value) => {
        currentInputText = value;
        });
    passActContent.subscribe((value) => {
        selectedContent = value;
        });
    hocContent.subscribe((value) => {
        hoc_results = value;
        });
    senContent.subscribe((value) => {
        sen_results = value;
        });
    
    function clearPassActContent() {
        passActContent.set({})
    }

    async function checkEmbedText() {
        isLoading = true;
        let fetchResults = [];
        try {
            // const concatenatedString = Object.values(selectedContent).join(', ')
            console.log(selectedBillstoSearch)
            const concatenatedString = [selectedContent.text1, selectedContent.text2, selectedContent.text3, selectedContent.text4].filter(Boolean).join('');
            const selectedBills = Object.keys(recommendedBills)
                .filter(parliamentKey => recommendedBills[parliamentKey].selected);
            const listBills = {
                "$or": selectedBills.map(item => ({ "gov-bill": { "$eq": item } }))
                }
            console.log(listBills)
            const requestBody = { text: concatenatedString, metadataFilters: listBills};
        // Perform your text embedding search using the request body
        const response = await fetch('https://flask-production-8d81.up.railway.app/vec', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        if (response.ok) {
                const embeddingResults = await response.json();
                error = null;

                // Fetch and store data for all results
                fetchResults = await Promise.all(
                    embeddingResults.map(async (result) => {
                        const data = await fetchSupabaseData(result.identifier, 'hoc');
                        return { ...result, supabaseData: data };
                    })
                );
                hocContent.set(fetchResults);
                console.log(fetchResults)
            } else {
                error = `Failed to fetch data. Status code: ${response.status}`;
                console.error('Error:', error);
            }
            } catch (err) {
                console.error('Error:', err);
                error = 'An error occurred while fetching data.';
            } finally {
                isLoading = false;
            }
    }

    async function checkHocSenCom(){
        searchHansardsInput.set(inputText);
        searchHansardsInputCurrent.set(inputText);
        hocContent.set(null);
        senContent.set(null);
        await checkHOC();
        await checkSEN();
    }

    async function checkHOC() {
        isLoading = true;
        let fetchResults = []; // Define fetchResults outside the try block
        try {
            // const concatenatedString = Object.values(selectedContent).join(', ')
            const requestBody = { text: inputText };
            // Perform your text embedding search using the request body
            const response = await fetch('https://flask-production-8d81.up.railway.app/vec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const embeddingResults = await response.json();
                error = null;

                // Fetch and store data for all results
                fetchResults = await Promise.all(
                    embeddingResults.map(async (result) => {
                        const data = await fetchSupabaseData(result.identifier, 'hoc');
                        return { ...result, supabaseData: data };
                    })
                );
                hocContent.set(fetchResults);
                console.log(fetchResults)
            } else {
                error = `Failed to fetch data. Status code: ${response.status}`;
                console.error('Error:', error);
            }
            } catch (err) {
                console.error('Error:', err);
                error = 'An error occurred while fetching data.';
            } finally {
                isLoading = false;
            }
    }

    async function checkSEN() {
    isLoading = true;
    let fetchResults = []; // Define fetchResults outside the try block
    try {
        // const concatenatedString = Object.values(selectedContent).join(', ')
        const requestBody = { text: inputText };
        // Perform your text embedding search using the request body
        const response = await fetch('https://flask-production-8d81.up.railway.app/vec_sen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const embeddingResults = await response.json();
            error = null;

            // Fetch and store data for all results
            fetchResults = await Promise.all(
                embeddingResults.map(async (result) => {
                    const data = await fetchSupabaseData(result.identifier, 'sen');
                    return { ...result, supabaseData: data };
                })
            );
            senContent.set(fetchResults);
        } else {
            error = `Failed to fetch data. Status code: ${response.status}`;
            console.error('Error:', error);
        }
        } catch (err) {
            console.error('Error:', err);
            error = 'An error occurred while fetching data.';
        } finally {
            isLoading = false;
        }
    }

    async function fetchSupabaseData(interventionId, database) {
        try {
        console.log(interventionId);
        const { data, error } = await supabase
            .from(database)
            .select('*')
            .eq('id', interventionId);
    
        if (error) {
            console.error('Error fetching data:', error.message);
            return null;
        }
    
        // Return the "text" column value if data exists
        if (data.length > 0) {
            return data[0];
        } else {
            return null; // No data found for the given intervention_id
        }
        } catch (error) {
        console.error('An error occurred:', error);
        return null;
        }
    }
    
    async function findRecommendedBills() {
        isLoading_check = true;
        bill_results = null;
        try {
            const concatenatedString = selectedContent.text1
            const requestBody = { text: concatenatedString };
            console.log(requestBody);

        // Perform your text embedding search using the request body
        const response = await fetch('https://flask-production-8d81.up.railway.app/vec_bill', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
    
        if (response.ok) {
            bill_results = await response.json();
            recommendedBills = bill_results.reduce((acc, item) => {
                const parliamentKey = item['metadata']['parliament'];
                const text = item['metadata']['text'];
                acc[parliamentKey] = { selected: false, text: text };
                return acc;
                }, {});
            

        } else {
            check_results = null;
            error = `Failed to fetch data. Status code: ${response.status}`;
            console.error('Error:', error);
        }
        } catch (err) {
        console.error('Error:', err);
        check_results = null;
        error = 'An error occurred while fetching data.';
        } finally {
        isLoading_check = false;
        }
    }

    function formatDate(inputDate) {
        const dateParts = inputDate.split('/');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const day = parseInt(dateParts[2], 10);

        const monthNames = [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ];

        const formattedDate = `${monthNames[month - 1]} ${day}, ${year}`;
        return formattedDate;
    }

    onMount(async () => {
        if (inputText !== currentInputText) {
            await checkHocSenCom();
        }
        if (selectedContent.title !== null) {
            await findRecommendedBills();
        }
    });
    
    
    </script>

    <AppShell>
    <svelte:fragment slot="pageHeader">
        <div class="bg-primary-500 text-white">
        <h2 class="h2 py-8 mx-20">Search Hansards</h2>
        </div>
    </svelte:fragment>
        <div class="container mx-auto mt-10 mb-6 px-5">
            <label class="label">
                <div style="display: flex; align-items: center; width: 100%;">
                <textarea bind:value={inputText} 
                    class="textarea p-3 border border-primary-500" rows="1" 
                    placeholder="search hansards" 
                    style="width: 100%; min-width: 450px;"></textarea>
                <button class="btn btn-lg variant-filled-secondary m-3" on:click={checkHocSenCom}>Search</button>
                </div>
            </label>
        </div>


    {#if Object.keys(selectedContent).length !== 0}
    <!-- <div class="p-4 variant-glass-primary">
    {#each Object.entries(selectedContent) as [key, value]}
        <p>{key}: {value}</p>
    {/each}
    </div> -->

    <section class="flex flex-col justify-center mx-20 my-3">
    <div class="bg-primary-100 my-2 shadow-xl">
        <div class="grid grid-cols-2 p-2">
            <h3 class="h3 text-primary-500 my-2">{selectedContent.title}</h3>
            <div class="flex justify-end"> <!-- Use flexbox to align buttons to the right -->
                <button class="btn btn-sm variant-filled-secondary m-2" on:click={checkEmbedText}>Search</button>
                <button class="btn btn-sm variant-filled-secondary m-2" on:click={clearPassActContent}>Clear</button>
            </div>
        </div>
        {#if selectedContent.h2}<h5 class="h5 mx-3">{selectedContent.h2}</h5>{/if}
        {#if selectedContent.h3}<p class="mx-3">{selectedContent.h3}</p>{/if}
        {#if selectedContent.note}<p class="mx-3">{selectedContent.note}</p>{/if}
        <section class="py-4">
        <div class="border border-primary-300 mx-4 p-2">
            {#if selectedContent.text1}<p style="margin-left: 0px;">{selectedContent.text1}</p>{/if}
            {#if selectedContent.text2}<p style="margin-left: 10px;">{selectedContent.text2}</p>{/if}
            {#if selectedContent.text3}<p style="margin-left: 20px;">{selectedContent.text3}</p>{/if}
            {#if selectedContent.text4}<p style="margin-left: 30px;">{selectedContent.text4}</p>{/if}
        </div>
        {#if isLoading_check}
        <div style="display: flex; align-items: center; justify-content: center;">
        <ProgressRadial ... stroke={200} width='w-10' class="m-5" meter="stroke-primary-500" track="stroke-primary-500/30" />
        </div>
        {/if}
        {#if bill_results}
        <div class="px-4 pt-2">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <p>Select following bills to filter search:</p>
                <div>
                    <button class="btn btn-sm variant-filled-secondary" on:click={toggleSearchAllBills}>
                    clear filter
                    </button>
                    <button class="btn btn-sm variant-filled-secondary" on:click={toggleBillInfo}>
                        {#if showBillInfo}
                            less info
                        {:else}
                            more info
                        {/if}
                    </button>
                </div>
            </div>
            <div class="{showBillInfo ? 'vertical-items' : 'horizontal-items'}">
                {#if showBillInfo}
                    {#each Object.keys(recommendedBills) as f}
                    <div class="flex mt-2">
                        <span
                        class="chip {recommendedBills[f].selected ? 'variant-filled-secondary' : 'variant-soft-primary'}"
                        on:click={() => { filter(f); }}
                        on:keypress
                        >
                        <span class="capitalize">{f.slice(0, 3) + ' ' + f.slice(3)}</span>
                        </span>
                        <span class="ml-3">{recommendedBills[f].text} </span></div>
                    {/each}
                {:else}
                    {#each Object.keys(recommendedBills) as f}
                        <span
                        class="chip {recommendedBills[f].selected ? 'variant-filled-secondary' : 'variant-soft-primary'} mr-1  mt-2"
                        on:click={() => { filter(f); }}
                        on:keypress
                        >
                        <span class="capitalize">{f.slice(0, 3) + ' ' + f.slice(3)}</span>
                        </span>
                    {/each}
                {/if}
            </div>
        </div>
        
        
        {/if}
    </section>
    </div>
    </section>
    {/if}
    
    <div class="container mx-auto text-center mt-10">
        <RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
            <RadioItem bind:group={selectedHocSenCom} name="justify" value='HOC'>House</RadioItem>
            <RadioItem bind:group={selectedHocSenCom} name="justify" value='SEN'>Senate</RadioItem>
            <RadioItem bind:group={selectedHocSenCom} name="justify" value='COM'>Committee</RadioItem>
        </RadioGroup>
    </div>

    {#if isLoading}
    <div style="display: flex; align-items: center; justify-content: center;">
    <ProgressRadial ... stroke={200} class="m-20" meter="stroke-primary-500" track="stroke-primary-500/30" />
    </div>
    {/if}


    {#if hoc_results !== null && selectedHocSenCom == 'HOC'}
    <section class="flex flex-col justify-center mx-20 my-3">  
    {#each hoc_results as result}
    <div class="bg-tertiary-500 my-2 shadow-xl p-2">
        <p class="mb-1"><strong>{#if result.supabaseData.date}{formatDate(result.supabaseData.date)}{/if}</strong></p>
        <p class="mb-1"><strong>Parliament:</strong> {result.supabaseData.parliament} {#if result.supabaseData.bill} <strong>Bill:</strong> {result.supabaseData.bill}{/if}</p>
        <p class="mb-1"><strong>Speaker:</strong> {#if result.supabaseData.speaker}{result.supabaseData.speaker}{/if}</p>
        <p>{#if result.supabaseData.text}{result.supabaseData.text}{/if}</p>
    </div>
        {/each}
    </section> 
    {/if}

    {#if sen_results !== null && selectedHocSenCom == 'SEN'}
    <section class="flex flex-col justify-center mx-20 my-3">  
    {#each sen_results as result}
    <div class="bg-tertiary-500 my-2 shadow-xl p-2">
        <p class="mb-1"><strong>{#if result.supabaseData.date}{formatDate(result.supabaseData.date)}{/if}</strong></p>
        <p class="mb-1"><strong>Parliament:</strong> {result.supabaseData.gov} {#if result.supabaseData.bill} <strong>Bill:</strong> {result.supabaseData.bill}{/if}</p>
        <p class="mb-1"><strong>Speaker:</strong> {#if result.supabaseData.speaker}{result.supabaseData.speaker}{/if}</p>
        <p>{#if result.supabaseData.text}{result.supabaseData.text}{/if}</p>
    </div>
        {/each}
    </section> 
    {/if}

    </AppShell>

    <style>
        .vertical-items {
            display: flex;
            flex-direction: column;
        }
    
        .horizontal-items {
            display: flex;
            flex-wrap: wrap;
        }
    </style>