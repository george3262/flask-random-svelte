    <script>
    import { supabase } from '../../lib/supabase';
    import { ProgressRadial } from '@skeletonlabs/skeleton';
    import { AppShell } from '@skeletonlabs/skeleton';
    import { passActContent, hocContent, senContent, searchHansardsInput, searchHansardsInputCurrent } from "../store.js"
    import { onMount } from 'svelte';
    import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

    let check_results = null;
    let hoc_results = null;
    let sen_results = null;
    let bill_results = [];
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
    let recommendedBills = {};
    let content = "";
    let contentXML = "";
    let formattedHTML = "";
    let groupedContent = null;


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
            const concatenatedString = [selectedContent.text1, selectedContent.text2, selectedContent.text3, selectedContent.text4].filter(Boolean).join('');
            const selectedBills = Object.keys(recommendedBills)
                .filter(parliamentKey => recommendedBills[parliamentKey].selected);
            const listBills = {
                "$or": selectedBills.map(item => ({ "gov-bill": { "$eq": item } }))
                }
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

    async function checkHocSenCom(text){
        if (text !== currentInputText && text !=="") {
            searchHansardsInput.set(text);
            searchHansardsInputCurrent.set(text);
            hocContent.set(null);
            senContent.set(null);
            await Promise.all([
            checkHOC(),
            checkSEN()]);
        }
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
                        // const content = await contentSet(data.intervention_id); // Fetch content
                        if (content !== null) {
                            result.supabaseData = data;
                            // result.supabaseData.content = content; // Append content to supabaseData
                        }
                        return result;
                    })
                );
                hocContent.set(fetchResults);
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
        const dateParts = inputDate.split('-');
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

    async function fetchSupabaseXML(parliament, sitting, targetString) {
        let id;
        if (sitting.length === 2) {
            id = parliament + "-0" + sitting;
        } else {
            id = parliament + "-" + sitting;
        }
        try {
            const { data, error } = await supabase
            .from('hoc_xml')
            .select('xml')
            .eq('id', id);
    
            if (error) {
            console.error('Error fetching data:', error.message);
            return null;
            }
    
            // Return the "text" column value if data exists
            if (data.length > 0) {
                contentXML = data[0].xml;
                const sentenceArray = targetString
                    .split(/[.!?]\s+/)
                    .filter(sentence => sentence.trim().split(/\s+/).length > 1);
                formattedHTML = formatXML(contentXML, sentenceArray);
                groupedContent = groupContentByTitles(formattedHTML, sentenceArray)

            } else {
            return null; // No data found for the given intervention_id
            }
        } catch (error) {
            console.error('An error occurred:', error);
            return null;
        }
    }

 // Define a mapping from XML tag names to HTML tag names
    const tagMapping = {
            'HansardBody': 'div',
            'Intro': 'div',
            'ParaText': 'p class="pb-3" style="margin-left: 30px;"',
            'OrderOfBusiness': 'div',
            'OrderOfBusinessTitle': 'h3 class="h3"',
            'CatchLine': 'p',
            'SubjectOfBusiness': 'div',
            'Timestamp': 'p',
            'FloorLanguage': 'p',
            'SubjectOfBusinessTitle': 'h4 class="h4"',
            'SubjectOfBusinessQualifier': 'h4 class="h4"',
            'SubjectOfBusinessContent': 'div',
            'Intervention': 'div',
            'PersonSpeaking': 'p style="margin-left: 15px; font-weight: bold;"',
            'Affiliation': 'span',
            'Content': 'div',
            'ProceduralText': 'p',
            'I': "span"
            // Add more mappings as needed
        };
    
    const tagsToSkip = ['Prayer'];

    function formatXML(xmlContent, sentenceArray) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

        // Find the "HansardBody" tag and start processing from there
        const hansardBody = xmlDoc.querySelector('HansardBody');
        if (hansardBody) {
            // Convert XML to HTML starting from "HansardBody"
            return convertXMLToHTML(hansardBody, sentenceArray);
        } else {
            return 'HansardBody tag not found in XML.';
        }
        
    }

    function convertXMLToHTML(node, sentenceArray = []) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName;

        // Check if the tag name is in the list of tags to skip
        if (tagsToSkip.includes(tagName)) {
            // If the tag is in the list of tags to skip, return an empty string
            return '';
        }

        // Pre-process the ParaText nodes
        if (tagName === 'ParaText') {
            let paraTextContent = node.textContent;
            let containsTarget = false;  // A flag to check if any target sentence is present

            for (const target of sentenceArray) {
                if (paraTextContent.includes(target)) {
                    containsTarget = true;
                    break;
                }
            }
            if (containsTarget) {
                // If the ParaText contains a target sentence, change its tag name and attributes
                tagMapping['ParaText'] = 'p class="pb-3 bg-secondary-100" style="margin-left: 30px;"';
            } else {
                // Reset to the default mapping if no target sentence is found
                tagMapping['ParaText'] = 'p class="pb-3" style="margin-left: 30px;"';
            }
        }

        // Check if the tag name is in your mapping
        if (tagMapping.hasOwnProperty(tagName)) {
            const mappedTagName = tagMapping[tagName];
            const openTag = `<${mappedTagName}>`;
            const closeTag = `</${mappedTagName}>`;
            let content = '';

            // Recursively process child nodes
            for (let i = 0; i < node.childNodes.length; i++) {
                content += convertXMLToHTML(node.childNodes[i], sentenceArray);
            }

            return `${openTag}${content}${closeTag}`;
        }
    } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        return text.length > 0 ? `${text}` : '';
    }

    return '';
}

    function groupContentByTitles(formattedHTML, sentenceArray) {
        // Parse the HTML into a DOM tree

        const parser = new DOMParser();
        const doc = parser.parseFromString(formattedHTML, 'text/html');

        // Create an array to store grouped content
        const groupedContent = [];

        // Iterate through the content elements and group them by titles
        doc.querySelectorAll('h4.h4').forEach((titleElement) => {
            const titleWithElement = {
                title: titleElement,
                content: []
            };
            let nextElement = titleElement.nextElementSibling;
            while (nextElement && nextElement.tagName !== 'H4') {
                titleWithElement.content.push(nextElement);
                nextElement = nextElement.nextElementSibling;
            }
            
            // Only add to groupedContent if the section contains any of the target strings
            const sectionHTML = titleWithElement.content.map(el => el.outerHTML).join("");
            if (sentenceArray.some(target => sectionHTML.includes(target))) {
                groupedContent.push(titleWithElement);
            }
        });

        return groupedContent;
    }


    function capitalizeFirstLetter(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    function ensureSpaceAfterPeriod(str) {
        return str.replace(/\.(?=[^\s])/g, '. ');
    }

    onMount(async () => {
        if (inputText !== currentInputText) {
            await checkHocSenCom(inputText);
        }
        if (selectedContent.title) {
            await Promise.all([
                checkHocSenCom(selectedContent.text1),
                findRecommendedBills()
            ]);
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
                <div style="display: flex; align-items: center; width: 100%;">
                <textarea bind:value={inputText} 
                    class="textarea p-3 border border-primary-500" rows="2" 
                    placeholder="search hansards" 
                    style="width: 100%; min-width: 450px;"></textarea>
                <button class="btn btn-lg variant-filled-secondary m-3" on:click={checkHocSenCom(inputText)}>Search</button>
                </div>
        </div>


    {#if Object.keys(selectedContent).length !== 0}

    <section class="flex flex-col justify-center mx-20 my-3">
    <div class="bg-primary-100 my-2 shadow-xl">
        <div class="grid grid-cols-2 p-2">
            <h3 class="h3 text-primary-500 my-2">{selectedContent.title}</h3>
            <div class="flex justify-end"> <!-- Use flexbox to align buttons to the right -->
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
                    <button class="btn btn-sm variant-filled-secondary" on:click={checkEmbedText}>search</button>
                    <!-- <button class="btn btn-sm variant-filled-secondary" on:click={toggleSearchAllBills}>
                    clear filter
                    </button> -->
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
        <Accordion autocollapse spacing="space-y-3">
        {#each hoc_results as result}
                <div class="bg-tertiary-500 my-2 shadow-xl">
                    <AccordionItem on:click={() => fetchSupabaseXML(result.supabaseData.parliament, result.supabaseData.sitting, ensureSpaceAfterPeriod(result.supabaseData.text))}>
                        <svelte:fragment slot="summary">
                        <div class="grid grid-cols-2 p-2">
                            <h3 class="h3 text-primary-500 my-2">{result.supabaseData.heading_title}: {result.supabaseData.sub_title}</h3> 
                            <div class="flex justify-end">
                                <button class="btn btn-sm variant-filled-secondary m-2">
                                    <a href="https://www.ourcommons.ca/DocumentViewer/en/{result.supabaseData.parliament.slice(0,2)}-{result.supabaseData.parliament.slice(-1)}/house/sitting-{result.supabaseData.sitting}/hansard#{result.supabaseData.intervention_id}" target="_blank" rel="noopener noreferrer">Original</a>
                                </button>
                            </div>
                        </div>
                        <p class="mb-1 mx-3">{formatDate(result.supabaseData.date)} | Parliament: {result.supabaseData.parliament} | Sitting: {result.supabaseData.sitting}{#if result.supabaseData.bill} | {result.supabaseData.bill}{/if}</p>
                        <p class="mb-1 mx-3"></p>
                        <!-- <p class="mb-1"><strong>{result.supabaseData.id}</strong></p> -->
                        <p class="mx-3">{result.supabaseData.procedural_text}</p>
                        <p class="mx-3">{result.supabaseData.sub_qualifier}</p>
                        <section class="py-4">
                            <div class="border border-primary-300 mx-4 p-2">
                                <p><strong>Speaker:</strong> {#if result.supabaseData.speaker}{result.supabaseData.speaker}{/if}</p>
                                <p>{#if result.supabaseData.text}{ensureSpaceAfterPeriod(result.supabaseData.text)}{/if}</p>
                            </div>
                        </section>
                        </svelte:fragment>
                        <svelte:fragment slot="content">
                            <section class="py-4">
                            {#if groupedContent}
                                {#each groupedContent as rowContent}
                                <div class="card mx-4 p-2 max-h-[600px] overflow-auto space-y-4 border border-primary-300">
                                    <h4 class="h4">{@html capitalizeFirstLetter(rowContent.title.innerHTML)}</h4>
                                    {#each rowContent.content as contentItem}
                                        <p>{@html contentItem.outerHTML}</p>
                                    {/each}
                                </div>
                                {/each}
                            {/if}
                            </section>
                        </svelte:fragment>
                    </AccordionItem>
                </div>
        {/each}
    </Accordion>
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

