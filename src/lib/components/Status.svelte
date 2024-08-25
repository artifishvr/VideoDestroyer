<script lang="ts">
  export let status: string;
  export let downloadURL: string;
  export let globalProgress: number;

  import { Button } from "$lib/components/ui/button/index.js";
  import { Progress } from "$lib/components/ui/progress/index.js";

  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import Clapperboard from "lucide-svelte/icons/clapperboard";
  import CircleCheck from "lucide-svelte/icons/circle-check";
  import Download from "lucide-svelte/icons/download";
  import RefreshCcw from "lucide-svelte/icons/refresh-ccw";
</script>

{#if status === "Loading"}
  <LoaderCircle size={48} class="animate-spin" />

  <p class="font-semibold text-2xl">Loading FFmpeg...</p>
{:else if status === "Destroying"}
  <Trash2 size={48} class="animate-bounce" />
  <p class="font-semibold text-2xl pb-4">Destroying...</p>

  <Progress value={globalProgress} max={100} class="w-96 mt-4" />
{:else if status === "Transcoding"}
  <Clapperboard size={48} class="animate-bounce" />
  <p class="font-semibold text-2xl pb-4">Transcoding...</p>

  <Progress value={globalProgress} max={100} class="w-96" />
{:else if status === "Complete"}
  <CircleCheck size={48} />

  <p class="font-semibold text-2xl pb-4">Complete!</p>

  <a href={downloadURL} download>
    <Button><Download size={24} class="mr-2 h-4 w-4" /> Download</Button>
  </a>

  <a href="/" data-sveltekit-reload class="mt-2">
    <Button variant="outline"
      ><RefreshCcw size={24} class="mr-2 h-4 w-4" /> Again!</Button>
  </a>
{/if}
