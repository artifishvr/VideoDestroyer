<script lang="ts">
  export let status: string;
  export let downloadURL: string;
  export let globalProgress: number;
  export let originalName: string;
  export let error: string;

  import { Progress } from "$lib/components/ui/progress/index.js";
  import Complete from "$lib/components/Complete.svelte";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import Trash2 from "lucide-svelte/icons/trash-2";
  import Clapperboard from "lucide-svelte/icons/clapperboard";
  import Errored from "$lib/components/Errored.svelte";
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
  <p class="font-semibold text-2xl pb-4">Normalizing...</p>

  <Progress value={globalProgress} max={100} class="w-96" />
{:else if status === "Error"}
  <Errored {error} />
{:else if status === "Complete"}
  <Complete {downloadURL} {originalName} />
{/if}
