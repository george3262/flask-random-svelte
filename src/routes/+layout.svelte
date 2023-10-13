<script>
  import "../app.postcss";
  import { AppShell } from '@skeletonlabs/skeleton';
  import { AppBar } from '@skeletonlabs/skeleton';

	// Dependency: Floating UI
  import { popup } from '@skeletonlabs/skeleton';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

</script>


<AppShell>
	<svelte:fragment slot="header">
  <AppBar shadow="shadow-2xl">
    <h1 class="h1 flex-none m-3 self-center">
      <a href="/">getHanswers</a>
    </h1>
    <svelte:fragment slot="trail">
      <div class="flex-auto flex justify-end">
        <!-- acts -->
        <div class="relative hidden lg:block">
          <!-- trigger -->
          <button class="btn hover:variant-soft-primary" use:popup={{ event: 'click', target: 'features1' }}>
            <span>acts</span>
            <i class="fa-solid fa-caret-down opacity-50" />
          </button>
          <!-- popup -->
          <div class="card p-4 w-60 shadow-xl" data-popup="features1">
            <nav class="list-nav">
              <ul>
                <li>
                  <a href="/acts/search">
                    <span>search</span>
                  </a>
                </li>
                <li>
                  <a href="/acts/browse">
                    <span>browse</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <!-- hansards -->
        <div class="relative hidden lg:block">
          <!-- trigger -->
          <button class="btn hover:variant-soft-primary" use:popup={{ event: 'click', target: 'features2' }}>
            <span>hansards</span>
            <i class="fa-solid fa-caret-down opacity-50" />
          </button>
          <!-- popup -->
          <div class="card p-4 w-60 shadow-xl" data-popup="features2">
            <nav class="list-nav">
              <ul>
                <li>
                  <a href="/hansards">
                    <span>search</span>
                  </a>
                </li>
                <li>
                  <a href="/hansards">
                    <span>browse (under construction)</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

      </div>
    </svelte:fragment>
  </AppBar>
  </svelte:fragment>

	<slot />

  <svelte:fragment slot="footer">
    <div class="p-4 text-center bg-primary-500 text-white">
        <!-- Footer content goes here -->
        <p>&copy; 2023 getHanswers</p>
    </div>
    </svelte:fragment>
    
</AppShell>
