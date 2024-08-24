<script lang="ts">
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { fetchFile, toBlobURL } from "$lib/ffmpegUtils";

  let downloadURL: string;

  let fileInput: HTMLInputElement;

  const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";

  let status = "Ready"; // "Loading" | "Destroying" | "Transcoding" | "Complete";
  let globalProgress = 0;

  async function transcode() {
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      globalProgress = progress * 100;
      globalProgress = Math.round(globalProgress);
    });

    status = "Loading";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });

    status = "Destroying";
    // @ts-ignore
    await ffmpeg.writeFile("test.mp4", await fetchFile(fileInput.files[0]));

    await ffmpeg.exec([
      "-i",
      "test.mp4",
      "-preset",
      "veryfast",
      "-minrate",
      "1k",
      "-maxrate",
      "1k",
      "-bufsize",
      "1k",
      "-b:v",
      "1k",
      "-af",
      `bass=g=5,volume=5dB`,
      "-b:a",
      "1k",
      "-r",
      "5",
      "-s",
      "100x100",
      `step1.mp4`,
    ]);

    status = "Transcoding";
    await ffmpeg.exec([
      "-i",
      "step1.mp4",
      "-b:v",
      "1k",
      "-r",
      "30",
      "-s",
      "1080x720",
      `final.mp4`,
    ]);

    const data = await ffmpeg.readFile("final.mp4");
    status = "Complete";

    downloadURL = URL.createObjectURL(
      new Blob([(data as Uint8Array).buffer], { type: "video/mp4" })
    );
  }
</script>

<div class="flex flex-col items-center justify-center h-screen">
  <input
    type="file"
    bind:this={fileInput}
    accept=".mp4"
    class={status === "Ready" ? "" : "hidden"} />
  {#if status === "Ready"}
    <button
      on:click={transcode}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3">
      Destroy
    </button>
  {:else if status === "Loading"}
    <div class="animate-spin">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-loader-circle"
        ><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    </div>

    <p class="font-semibold text-md">Loading FFmpeg...</p>
  {:else if status === "Destroying"}
    <div class="animate-bounce">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-trash-2"
        ><path d="M3 6h18" /><path
          d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
          d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line
          x1="10"
          x2="10"
          y1="11"
          y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
    </div>
    <p class="font-semibold text-md">Destroying...</p>
  {:else if status === "Transcoding"}
    <div class="animate-bounce">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-clapperboard"
        ><path
          d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" /><path
          d="m6.2 5.3 3.1 3.9" /><path d="m12.4 3.4 3.1 4" /><path
          d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
    </div>
    <p class="font-semibold text-md">Transcoding...</p>
  {:else if status === "Complete"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-circle-check"
      ><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>

    <p class="font-semibold text-md">Complete!</p>

    <a href={downloadURL} download>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-3"
        >Download</button>
    </a>
  {/if}
</div>
