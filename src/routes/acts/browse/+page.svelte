<script>
  import { supabase } from '../../../lib/supabase';
  import { ProgressRadial } from '@skeletonlabs/skeleton';
  import { AppShell } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { passActTitle, passActContent, ActContent, allActs } from "../../store.js"
  
  let selectedInput = null;
  let selectedContent = null;
  let allActsData = []; // To store your data options
  let isLoading = false;
  let isDrawerVisible = false;
  let selectedRange = 'all'
  // Define custom labels for the range slider
  const rangeLabels = ['all', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))];
  let filteredData = allActsData;
  let parsedHTMLelements = null;
  let act_html = null;
  let selectedText = ''; // Initialize the variable to store the selected child's text
  let selectedHeadings = {};

  passActTitle.subscribe((value) => {
    selectedInput = value;
    });
  
  passActContent.subscribe((value) => {
    selectedContent = value;
    });
  
  ActContent.subscribe((value) => {
    parsedHTMLelements = value;
    });

  allActs.subscribe((value) => {
    allActsData = value;
    });

  // Subscribe to changes in the selectedRange and filter the data accordingly
  $: {
    if (selectedRange === 'all') {
      // If "all" is selected, show all data
      filteredData = allActsData;
    } else {
      // Otherwise, filter data based on the selected range
      filteredData = allActsData.filter((item) => item.label.toLowerCase().startsWith(selectedRange));
    }
  }

  $: { 
    openAct(selectedInput)
  }

  // Inside your fetchDataFromColumn function
  async function fetchDataFromColumn() {
    isLoading = true;
    let formattedActs = [];
    try {
      let allData = new Set(); // Use a Set to store unique values
      let page = 1;
      let pageSize = 1000; // Adjust this to your preferred page size

      while (true) {
        const { data: fetchedData, error } = await supabase
          .from('acts_html') // Replace with your table name
          .select('title')
          .range(page, pageSize)
          .order('title', { ascending: true }); // Paginate the query

        if (error) {
          console.error('Error fetching data:', error.message);
          return [];
        }

        if (fetchedData && fetchedData.length > 0) {
          fetchedData.forEach((item) => allData.add(item.title)); // Add unique values to the Set
          page++; // Move to the next page
          if (fetchedData.length < pageSize) {
            break; // Exit the loop when no more data is available
          }
        } else {
          break; // Exit the loop when no data is available
        }
      }

      formattedActs = Array.from(allData).map((item) => ({
        label: item,
        value: item
      }));
      allActs.set(formattedActs);

    } catch (error) {
      console.error('An error occurred:', error);
      return [];
    } finally {
      isLoading = false;
    }
  }

  onMount(async () => {
    if (allActsData.length === 0) {
    await fetchDataFromColumn();
    }
  });

  async function openAct(title) {
    closeDrawer()
    passActTitle.set(title)
    // Fetch the HTML content and wait for it to load
    act_html = await fetchSupabaseHTML(title);

    // Check if act_html is not null before parsing
    if (act_html) {
        const parsedElements = parseHTMLContent(act_html.html); // Use the correct tag name
        ActContent.set(parsedElements);
    }
}

  async function fetchSupabaseHTML(title) {
          try {
              const { data, error } = await supabase
              .from('acts_html')
              .select('html')
              .eq('title', title);
      
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

  function parseHTMLContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const nodes = [];
    let nestingLevel = 0;
    const latestHeadings = { h1: '', h2: '', h3: '', h4: '', note: ''};

    // Function to push a new node with nesting level
    function pushNode(node, level) {
        nodes.push({
            tagName: node.tagName,
            innerHTML: node.outerHTML, // Get the HTML including the element itself
            textContent: node.textContent, // Get the text content without HTML tags
            nestingLevel: level, // Add nesting level information
            headings: { ...latestHeadings }, // Clone the latest headings
        });
    }

    // Iterate through all "section" elements
    const sectionElements = doc.querySelectorAll('section');
    sectionElements.forEach((section) => {
        Array.from(section.children).forEach((child) => {
            if (child.tagName === 'HEADER') {
                pushNode(child, 0)
                Array.from(child.children).forEach((sub)=>{
                    if(sub.classList.contains('Title-of-Act')){
                        latestHeadings.h1 = sub.textContent;
                        latestHeadings.h2 = "";
                        latestHeadings.h3 = "";
                        latestHeadings.h4 = "";
                        latestHeadings.note = "";
                    }});
            } else if (child.tagName === 'H1') {
                        pushNode(child, 0)
                        latestHeadings.h1 = child.textContent;
                        latestHeadings.h2 = "";
                        latestHeadings.h3 = "";
                        latestHeadings.h4 = "";
                        latestHeadings.note = "";
            } else if (child.tagName === 'H2') {
                pushNode(child, 0)
                Array.from(child.children).forEach((sub)=>{
                    if (sub.classList.contains('HTitleText1')){
                        const HTitleText1 = sub.textContent
                        latestHeadings.h2 = HTitleText1;
                        latestHeadings.h3 = "";
                        latestHeadings.h4 = "";
                        latestHeadings.note = "";
                    }else{
                        latestHeadings.h2 = sub.textContent;
                        latestHeadings.h3 = "";
                        latestHeadings.h4 = "";
                        latestHeadings.note = "";
                }});
            } else if (child.tagName === 'H3') {
                pushNode(child, 0)
                Array.from(child.children).forEach((sub)=>{
                    if (sub.classList.contains('HTitleText2')){
                        const HTitleText2 = sub.textContent
                        latestHeadings.h3 = HTitleText2;
                        latestHeadings.h4 = "";
                        latestHeadings.note = "";
                    }else{
                        latestHeadings.h3 = sub.textContent;
                        latestHeadings.h4 = "";
                        latestHeadings.note = "";
                }});
            } else if (child.tagName === 'H4') {
                pushNode(child, 0)
                Array.from(child.children).forEach((sub)=>{
                    if (sub.classList.contains('HTitleText3')){
                        const HTitleText3 = sub.textContent
                        latestHeadings.h4 = HTitleText3;
                        latestHeadings.note = "";
                    }else{
                        latestHeadings.h4 = sub.textContent;
                        latestHeadings.note = "";
                }});
            } else if (child.classList.contains('MarginalNote')) {
                pushNode(child, 0)
                        latestHeadings.note = child.textContent?.replace("Marginal note:",""); 
            } else if (child.tagName === 'DL') {
              Array.from(child.children).forEach((DLChild) => {
                                if (DLChild.tagName === 'DT'){
                                  pushNode(DLChild, 2)
                                } else if (DLChild.tagName === 'DD'){
                                    Array.from(DLChild.children).forEach((DL2Child) => {
                                      if (DL2Child.tagName === 'UL'){
                                        Array.from(DL2Child.children).forEach((DL3Child) => {
                                            pushNode(DL3Child, 4); 
                                        }); 
                                    } else {
                                          pushNode(DL2Child, 3);
                                      }});
                                } else {
                                    pushNode(DLChild, 2);
                                }});
            } else if (child.tagName === 'UL') {
                Array.from(child.children).forEach((LiChild) => {
                    Array.from(LiChild.children).forEach((Li2Child) => {
                        if (Li2Child.tagName === 'UL') {
                            pushNode(Li2Child, 3); 
                        } else if (Li2Child.tagName === 'DL') {
                            Array.from(Li2Child.children).forEach((DLChild) => {
                                if (DLChild.tagName === 'DT'){
                                  pushNode(DLChild, 3)
                                } else if (DLChild.tagName === 'DD'){
                                    Array.from(DLChild.children).forEach((DL2Child) => {
                                      if (DL2Child.tagName === 'UL'){
                                        Array.from(DL2Child.children).forEach((DL3Child) => {
                                            pushNode(DL3Child, 5); 
                                        }); 
                                    } else {
                                          pushNode(DL2Child, 4);
                                      }});
                                } else {
                                    pushNode(DLChild, 3);
                                }});
                        } else if (Li2Child.classList.contains('MarginalNote')) {
                            latestHeadings.note = Li2Child.textContent?.replace("Marginal note:",""); 
                        } else {
                            pushNode(Li2Child, 2);
                        }
                    });
                });
            } else {
                pushNode(child, 1);
            }
        });
    });
    
    return nodes;
}

// Function to toggle the drawer visibility
function toggleDrawer(text, headings) {
  if (isDrawerVisible && selectedText === text) {
    // If the drawer is already visible and the same text is clicked again, hide the drawer
    isDrawerVisible = false;
    selectedText = "";
  } else {
    // Otherwise, show the drawer and update the selected text
    isDrawerVisible = true;
    selectedText = text;
    selectedHeadings = headings;
    passActContent.set({
                        'title': headings.h1,
                        'h2': headings.h2,
                        'h3': headings.h3,
                        'note': headings.note,
                        'text1': text,
                        'text2': null,
                        'text3': null,
                        'text4': null
                    }

    )
  }
}

function closeDrawer() {
  isDrawerVisible = false;
}
function openDrawer() {
  isDrawerVisible = true;
}


</script>

<AppShell>

  {#if isLoading}
  <div style="display: flex; align-items: center; justify-content: center;">
    <ProgressRadial ... stroke={200} class="m-20" meter="stroke-primary" track="stroke-primary-500/30" />
  </div>
  {/if}

  {#if isLoading == false}
  <div class="bg-primary-500 text-white">
    <h2 class="h2 py-8 mx-20">Browse Federal Acts</h2>
  </div>
  
  <!-- {#if selectedContent.text1 != null}
  <p>{selectedContent.title}</p>
  <p>{selectedContent.h2}</p>
  <p>{selectedContent.h3}</p>
  <p>{selectedContent.note}</p>
  <p>{selectedContent.text1}</p>
  <p>{selectedContent.text2}</p>
  <p>{selectedContent.text3}</p>
  <p>{selectedContent.text4}</p>
  <br>
  {/if} -->

  <div class="container mx-auto mx-20 my-10">
    <div class="flex items-center space-x-4">
      <span>Select:</span>
      <div class="flex">
        <select class="select border border-primary-500 w-full" bind:value={selectedInput}>
          {#each filteredData as item}
          <option value={item.label}>{item.label}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="flex flex-row items-center my-2">
        <RadioGroup background="bg-primary-100" display="flex w-full" active="variant-filled-secondary" hover="hover:variant-soft-secondary">
          {#each rangeLabels as label}
          <RadioItem bind:group={selectedRange} name="justify" value={label}>{label}</RadioItem>
          {/each}
        </RadioGroup>
    </div>
  </div>
  {/if}

  {#if parsedHTMLelements !== null}
    <div class="m-10 mb-10 p-5 variant-filled-primary-50">      
      {#each parsedHTMLelements as element}
      {#if element.tagName == "HEADER"}
        <h2 class="h2">{@html element.innerHTML}</h2>
      {:else if element.tagName == "H2"}
        <h3 class="h3">{@html element.innerHTML}</h3>
      {:else if element.tagName == "H3"}
        <h4 class="h4">{@html element.innerHTML}</h4>
      {:else if element.tagName == "H4"}
        <h5 class="h5">{@html element.innerHTML}</h5>
      {:else}
      <div class="flex items-center space-x-4" style="margin-left: {element.nestingLevel * 20}px;">
        {#if [selectedContent.text1].includes(element.textContent)}
          <div class="bg-primary-100 hover-bg cursor-pointer select-text" on:click={() => toggleDrawer(element.textContent, element.headings)}>
            <p id="scrollToThis">{element.textContent.replace("Marginal note:",'')}</p>
          </div>
        {:else if [selectedContent.text2, selectedContent.text3, selectedContent.text4].includes(element.textContent)}
          <div class="bg-primary-100 hover-bg cursor-pointer select-text" on:click={() => toggleDrawer(element.textContent, element.headings)}>
            <p>{element.textContent.replace("Marginal note:",'')}</p>
          </div>
        {:else}
            <div class="hover-bg cursor-pointer select-text" on:click={() => toggleDrawer(element.textContent, element.headings)}>
              <p>{element.textContent.replace("Marginal note:",'')}</p>
            </div>
        {/if}
      </div>  
      {/if}
    {/each}
      </div>
  {/if}

  <div class="bottom-drawer" class:active={isDrawerVisible} on:click={closeDrawer}>
    <div class="p-4 bg-primary-500 text-white">
      {#if selectedContent.title}
        <!-- Loop through the headings dictionary -->
        <h3 class="h3 mx-4 my-2">{selectedContent.title}</h3>
        {#if selectedContent.h2}<h5 class="h5 mx-4">{selectedContent.h2}</h5>{/if}
        {#if selectedContent.h3}<p class="mx-4">{selectedContent.h3}</p>{/if}
        {#if selectedContent.note}<p class="mx-4">{selectedContent.note}</p>{/if}
        <div class="border border-primary-300 mx-4 p-2">
          {#if selectedContent.text1}<p style="margin-left: 0px;">{selectedContent.text1}</p>{/if}
          {#if selectedContent.text2}<p style="margin-left: 10px;">{selectedContent.text2}</p>{/if}
          {#if selectedContent.text3}<p style="margin-left: 20px;">{selectedContent.text3}</p>{/if}
          {#if selectedContent.text4}<p style="margin-left: 30px;">{selectedContent.text4}</p>{/if}
      </div>
        <div class="flex justify-center items-center">
          <button type="button" class="btn variant-filled-secondary m-4">
            <a href="/hansards">Search Hansards</a>
          </button>
          <!-- <button type="button" class="btn variant-filled-secondary m-4" on:click={closeDrawer}>
            Close Drawer
          </button> -->
        </div>
      {/if}
    </div>
  </div>

{#if selectedContent.title}
<!-- Floating button to open the drawer -->
<button class="floating-button btn variant-filled-secondary m-4" on:click={openDrawer}>
  Open Drawer
</button>
{/if}

</AppShell>

<style>
  .bottom-drawer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 60vh; /* Adjust the maximum height as needed */
    overflow-y: auto;
    background-color: variant-glass-primary;
    z-index: 1000;
    transition: transform 0.3s;
    transform: translateY(100%);
  }

  .bottom-drawer.active {
    transform: translateY(0);
  }
  .hover-bg:hover {
    background-color: #dfd1d9;
  /* Other hover styles */
}


  /* Style for the floating button */
  .floating-button {
    position: fixed;
    bottom: 5px; /* Adjust the position as needed */
    right: 20px; /* Adjust the position as needed */
    padding: 10px 20px;
    cursor: pointer;
  }


</style>