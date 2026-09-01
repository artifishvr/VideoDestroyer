<script lang="ts">
  export let error: string;

  import { Button } from "$lib/components/ui/button/index.js";

  import RefreshCcw from "lucide-svelte/icons/refresh-ccw";
  import CircleX from "lucide-svelte/icons/circle-x";
</script>

<CircleX size={48} />

<h1 class="font-semibold text-2xl pb-2 pt-2">Error!</h1>
<p class="font-medium text-md pb-4">{error}</p>


<a href="/" data-sveltekit-reload class="mt-2">
  <Button variant="outline"
    ><RefreshCcw size={24} class="mr-2 h-4 w-4" /> Try Something Else!</Button>
</a>