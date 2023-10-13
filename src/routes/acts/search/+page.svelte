<script>
    import { supabase } from '../../../lib/supabase';
    import { ProgressRadial } from '@skeletonlabs/skeleton';
    import { AppShell } from '@skeletonlabs/skeleton';
    import { passActTitle, passActContent, searchedActContent, searchActsInput, searchActsInputCurrent } from '../../store.js';
    import { onMount } from 'svelte';

    let inputText = "";
    let currentInputText = "";
    let results = null;
    let error = null;
    let isLoading = false;

    searchedActContent.subscribe((value) => {
        results = value;
        });

    searchActsInput.subscribe((value) => {
        inputText = value;
        });
    
    searchActsInputCurrent.subscribe((value) => {
        currentInputText = value;
        });

    async function openAct(identifier) {
        passActTitle.set(identifier.title);
        passActContent.set(identifier);
        
        }

    async function embedText() {
        searchActsInput.set(inputText)
        searchActsInputCurrent.set(inputText)
        isLoading = true;
        try {
        // Initialize the request body
        const requestBody = { text: inputText };
    
        // Perform your text embedding search using the request body
        const response = await fetch('https://flask-production-8d81.up.railway.app/act_vec', {
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
            const fetchResults = await Promise.all(
            embeddingResults.map(async (result) => {
                const data = await fetchSupabaseData(result.identifier, 'acts');
                return { ...result, supabaseData: data };
            })
            );
            results = fetchResults;
            searchedActContent.set(results);
        } else {
            results = null;
            error = `Failed to fetch data. Status code: ${response.status}`;
            console.error('Error:', error);
        }
        } catch (err) {
        console.error('Error:', err);
        results = null;
        error = 'An error occurred while fetching data.';
        } finally {
        isLoading = false;
        }
    }

    async function fetchSupabaseData(interventionId, database) {
        try {

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

    onMount(async () => {
        if (inputText !== currentInputText) {
        await embedText();
        }});
    </script>

<AppShell>

<svelte:fragment slot="pageHeader">
    <div class="bg-primary-500 text-white">
        <h2 class="h2 py-8 mx-20">Search Federal Acts</h2>
    </div>

    <div class="container mx-auto mt-10 mb-6 px-5">
            <label class="label">
                <div style="display: flex; align-items: center; width: 100%;">
                <textarea bind:value={inputText} 
                    class="textarea p-3 border border-primary-500" rows="1" 
                    placeholder="search acts" 
                    style="width: 100%; min-width: 450px;"></textarea>
                <button class="btn btn-lg variant-filled-secondary m-3" on:click={embedText}>Search</button>
                </div>
            </label>
    </div>
</svelte:fragment>


{#if isLoading}
<div style="display: flex; align-items: center; justify-content: center;">
    <ProgressRadial ... stroke={200} class="m-20" meter="stroke-primary-500" track="stroke-primary-500/30" />
</div>
{/if}

{#if results !== null}
<section class="flex flex-col justify-center mx-20 my-3">
    {#each results as result, index}
            <div class="bg-tertiary-500 my-2 shadow-xl">
                <div class="grid grid-cols-2 p-2">
                    <h3 class="h3 text-primary-500 my-2">{result.supabaseData.title_of_act}</h3>
                    <div class="flex justify-end"> <!-- Use flexbox to align buttons to the right -->
                        <button type="button" class="btn btn-sm variant-filled-secondary m-2" on:click={() => 
                            openAct({
                            'title': result.supabaseData.title_of_act,
                            'h2': result.supabaseData.h2_title,
                            'h3': result.supabaseData.h3_title,
                            'note': result.supabaseData.marginal_note,
                            'text1': result.supabaseData.text_1,
                            'text2': result.supabaseData.text_2,
                            'text3': result.supabaseData.text_3,
                            'text4': result.supabaseData.text_4
                            })}
                        >
                            <a href="/acts/browse">Browse Act</a>
                        </button>
                        <button type="button" class="btn btn-sm variant-filled-secondary m-2" on:click={() => 
                            openAct({
                            'title': result.supabaseData.title_of_act,
                            'h2': result.supabaseData.h2_title,
                            'h3': result.supabaseData.h3_title,
                            'note': result.supabaseData.marginal_note,
                            'text1': result.supabaseData.text_1,
                            'text2': result.supabaseData.text_2,
                            'text3': result.supabaseData.text_3,
                            'text4': result.supabaseData.text_4
                            })}
                        >
                            <a href="/hansards">Search Hansards</a>
                        </button>
                    </div>
                </div>
                {#if result.supabaseData.h2_title}<h5 class="h5 mx-3">{result.supabaseData.h2_title}</h5>{/if}
                {#if result.supabaseData.h3_title}<p class="mx-3">{result.supabaseData.h3_title}</p>{/if}
                {#if result.supabaseData.marginal_note}<p class="mx-3">{result.supabaseData.marginal_note}</p>{/if}
                <section class="py-4">
                <div class="border border-primary-300 mx-4 p-2">
                    {#if result.supabaseData.text_1}<p style="margin-left: 0px;">{result.supabaseData.text_1}</p>{/if}
                    {#if result.supabaseData.text_2}<p style="margin-left: 10px;">{result.supabaseData.text_2}</p>{/if}
                    {#if result.supabaseData.text_3}<p style="margin-left: 20px;">{result.supabaseData.text_3}</p>{/if}
                    {#if result.supabaseData.text_4}<p style="margin-left: 30px;">{result.supabaseData.text_4}</p>{/if}
                </div>
                </section>
            </div>
    {/each}
</section>
{/if}

<svelte:fragment slot="pageFooter">
<p>test</p>
</svelte:fragment>

</AppShell>
