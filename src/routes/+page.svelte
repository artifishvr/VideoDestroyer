<script lang="ts">
  import Status from "$lib/components/Status.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { fetchFile, toBlobURL } from "$lib/ffmpegUtils";

  let downloadURL: string;

  let fileInput: HTMLInputElement;

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

  type StatusType =
    | "Ready"
    | "Loading"
    | "Destroying"
    | "Transcoding"
    | "Complete";

  let status: StatusType = "Ready";
  let globalProgress: number = 0;

  async function transcode() {
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress }: { progress: number }) => {
      globalProgress = progress * 100;
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
    // @ts-ignore
    await ffmpeg.writeFile("test.mp4", await fetchFile(fileInput.files[0]));

    await ffmpeg.exec([
      "-i",
      "test.mp4",
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
      `step1.mp4`,
    ]);

    status = "Transcoding";
    await ffmpeg.exec([
      "-i",
      "step1.mp4",
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
  <h2 class="text-md font-semibold pb-4 {status === 'Ready' ? '' : 'hidden'}">
    Supports MP4 files. Runs in the browser via ffmpeg.wasm.
  </h2>

  <input
    class="{status === 'Ready' ? '' : 'hidden'} text-center"
    type="file"
    bind:this={fileInput}
    accept=".mp4" />

  <Button
    on:click={transcode}
    class="mt-3 {status === 'Ready' ? '' : 'hidden'}">
    Destroy
  </Button>
  <Status bind:status bind:downloadURL {globalProgress} />

  <p class="absolute bottom-0 mb-8 text-gray-300">
    with ❤️ by <a
      href="https://arti.gay?ref=videodestroyer"
      target="_blank"
      class="underline text-blue-300">arti</a>
  </p>
</div>
