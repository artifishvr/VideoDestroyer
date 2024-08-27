<script lang="ts">
  import Status from "$lib/components/Status.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { fetchFile, toBlobURL } from "$lib/ffmpegUtils";
  import { toast } from "svelte-sonner";
  import Dropzone from "$lib/components/Dropzone.svelte";

  let downloadURL: string;
  let originalName: string;

  let inputFile: File;

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  type StatusType =
    | "Ready"
    | "Loading"
    | "Destroying"
    | "Transcoding"
    | "Complete";

  let status: StatusType = "Ready";
  let globalProgress: number = 0;

  async function destroy() {
    if (!inputFile) return toast.error("No file selected");

    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      globalProgress = progress * 100;
    });

    ffmpeg.on("log", ({ type, message }) => {
      console.log(type, message);
    });

    status = "Loading";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    status = "Destroying";

    await ffmpeg.writeFile("raw.mp4", await fetchFile(inputFile));

    originalName = inputFile.name;

    await ffmpeg.exec([
      "-i",
      "raw.mp4",
      "-preset",
      "veryfast",
      "-maxrate",
      "2k",
      "-b:v",
      "2k",
      "-af",
      `bass=g=10`,
      "-b:a",
      "1k",
      "-r",
      "12",
      "-s",
      "100x100",
      `destroyed.mp4`,
    ]);

    status = "Transcoding";
    await ffmpeg.exec([
      "-i",
      "destroyed.mp4",
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "-preset",
      "veryfast",
      "-r",
      "12",
      "-af",
      "volume=-5dB",
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

<svelte:head>
  <title>Video Destroyer</title>
</svelte:head>

<div class="flex flex-col items-center justify-center h-screen">
  <h1 class="text-5xl font-bold pb-2 {status === 'Ready' ? '' : 'hidden'}">
    Video Destroyer
  </h1>
  <h2
    class="text-md font-semibold pb-4 text-center {status === 'Ready'
      ? ''
      : 'hidden'}">
    Runs 100% in-browser, supports H.264, H.265, VP8/VP9, and OGV.<br />No file
    size/length limit. 2 mins or less is recommended.
  </h2>

  <Dropzone bind:file={inputFile} hidden={status !== "Ready"} />

  <Button on:click={destroy} class="mt-3 {status === 'Ready' ? '' : 'hidden'}">
    Destroy
  </Button>
  <Status {status} {downloadURL} {globalProgress} {originalName} />

  <p class="absolute bottom-0 mb-8 text-gray-300 text-sm">
    with ❤️ by <a
      href="https://arti.gay?ref=videodestroyer"
      target="_blank"
      class="underline text-blue-300">arti</a>
  </p>
</div>
