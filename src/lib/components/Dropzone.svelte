<script lang="ts">
  import Dropzone from "svelte-file-dropzone";
  import { toast } from "svelte-sonner";
  import Upload from "lucide-svelte/icons/upload";

  export let file: File;
  export let hidden: boolean = false;

  function handleFilesSelect(e: any) {
    const { acceptedFiles, fileRejections } = e.detail;

    if (acceptedFiles > 1) toast.error("Only 1 file can be uploaded at a time");

    file = acceptedFiles[0];

    if (fileRejections.length > 0) {
      toast.error("File type not supported: " + fileRejections[0].name);
    }
  }
</script>

<Dropzone
  on:drop={handleFilesSelect}
  disableDefaultStyles={true}
  multiple={false}>
  <div class="flex items-center justify-center w-96 {hidden ? 'hidden' : ''}">
    <div
      class="flex flex-col items-center justify-center w-full h-64 border-2 overflow-hidden border-zinc-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:border-zinc-500">
      <div class="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload size={28} color="#a1a1aa" strokeWidth={2.5} />
        <p class="my-2 text-sm text-zinc-500 dark:text-zinc-400">
          {#if file}
            <p class="font-semibold truncate">
              {file.name}
            </p>
          {:else}
            <span class="font-semibold">Click to upload</span> or drag and drop
          {/if}
        </p>
      </div>
    </div>
  </div>
</Dropzone>
