<script lang="ts">
  export let downloadURL: string;

  import { mediaQuery } from "svelte-legos";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Drawer from "$lib/components/ui/drawer/index.js";

  import CircleCheck from "lucide-svelte/icons/circle-check";
  import Download from "lucide-svelte/icons/download";
  import RefreshCcw from "lucide-svelte/icons/refresh-ccw";
  import Film from "lucide-svelte/icons/film";

  let open = false;
  const isDesktop = mediaQuery("(min-width: 768px)");
</script>

<CircleCheck size={48} />

<p class="font-semibold text-2xl pb-4">Complete!</p>

<a href={downloadURL} download>
  <Button><Download size={24} class="mr-2 h-4 w-4" /> Download</Button>
</a>

<Button
  variant="secondary"
  class="mt-2"
  on:click={() => {
    open = true;
  }}><Film size={24} class="mr-2 h-4 w-4" /> View</Button>

<a href="/" data-sveltekit-reload class="mt-2">
  <Button variant="outline"
    ><RefreshCcw size={24} class="mr-2 h-4 w-4" /> Again!</Button>
</a>

{#if $isDesktop}
  <Dialog.Root bind:open>
    <Dialog.Content class="sm:max-w-[425px]">
      <!-- svelte-ignore a11y-media-has-caption -->
      <video src={downloadURL} controls class="w-full pt-4" playsinline />
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open>
    <Drawer.Content>
      <!-- svelte-ignore a11y-media-has-caption -->
      <video src={downloadURL} controls class="w-full p-4" playsinline />
      <Drawer.Footer class="pt-2">
        <Drawer.Close asChild let:builder>
          <Button variant="outline" builders={[builder]}>Close</Button>
        </Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{/if}
