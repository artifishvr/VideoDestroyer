<script lang="ts">
  import Status from "$lib/components/Status.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { FFmpeg } from "@ffmpeg/ffmpeg";
  import { fetchFile, toBlobURL } from "$lib/ffmpegUtils";
  import { toast } from "svelte-sonner";
  import Dropzone from "$lib/components/Dropzone.svelte";

  let downloadURL: string;
  let originalName: string;
  let error: string;

  let inputFile: File;

  const CORE_VERSION = "0.12.10";
  const coreBaseURL = (pkg: "core" | "core-mt") =>
    `https://unpkg.com/@ffmpeg/${pkg}@${CORE_VERSION}/dist/esm`;

  type StatusType =
    | "Ready"
    | "Loading"
    | "Destroying"
    | "Transcoding"
    | "Error"
    | "Complete";

  let status: StatusType = "Ready";
  let globalProgress: number = 0;

  async function destroy() {
    try {
      if (!inputFile) return toast.error("No file selected");

      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        globalProgress = progress * 100;
      });

      ffmpeg.on("log", ({ type, message }) => {
        console.log(type, message);
      });

      status = "Loading";

      const multithread = false;
      console.log(
        multithread
          ? "ffmpeg: using multi-threaded core"
          : "ffmpeg: cross-origin isolation unavailable, using single-threaded core",
      );

      const baseURL = coreBaseURL(multithread ? "core-mt" : "core");

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
        // @ts-ignore
        ...(multithread && {
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript",
          ),
        }),
      });

      status = "Destroying";

      await ffmpeg.writeFile("raw.mp4", await fetchFile(inputFile));

      originalName = inputFile.name;

      await ffmpeg.exec([
        "-i",
        "raw.mp4",
        "-c:v",
        "libx264",
        "-crf",
        "51",
        "-preset",
        "ultrafast",
        "-g",
        "9999",
        "-r",
        "2",
        "-vf",
        "scale=64:64:flags=neighbor",
        "-b:v",
        "1k",
        "-c:a",
        "aac",
        "-ac",
        "1",
        "-ar",
        "8000",
        "-b:a",
        "1k",
        "-af",
        "acrusher=bits=2,volume=20,bass=g=20",

        "destroyed.mp4",
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
        "volume=-20dB",
        "-s",
        "1080x720",
        `final.mp4`,
      ]);

      const result = await ffmpeg.readFile("final.mp4");
      status = "Complete";

      const data = result as Uint8Array;
      const copy = new Uint8Array(data.length);
      copy.set(data);

      downloadURL = URL.createObjectURL(
        new Blob([copy], { type: "video/mp4" }),
      );
    } catch (e: any) {
      console.error(e);
      status = "Error";
      error = e;
      toast.error("An error occurred while destroying the video");
    }
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
    Runs on-device, supports <a href="https://ffmpegwasm.netlify.app/docs/overview#libraries" target="_blank" class="underline">many codecs</a><br />
  </h2>

  <Dropzone bind:file={inputFile} hidden={status !== "Ready"} />

 <p
    class="text-sm text-zinc-300 pt-2 text-center {status === 'Ready'
      ? ''
      : 'hidden'}">
    2GB file size limit, shorter is better (its slow, takes ~2-4x the length of the original video)
  </p>
  <Status {status} {downloadURL} {globalProgress} {originalName} {error} />
  <Button on:click={destroy} class="mt-3 {status === 'Ready' ? '' : 'hidden'}">
    Destroy
  </Button>

 

  <p class="absolute bottom-0 mb-8 text-gray-300 text-sm text-center">
    with ❤️ by <a
      href="https://arti.gay?ref=videodestroyer"
      target="_blank"
      class="underline text-blue-300">arti</a>
      <br/><a href="https://github.com/artifishvr/VideoDestroyer" target="_blank" class="text-blue-300 underline">github.com/artifishvr/VideoDestroyer</a>
  </p>
</div>
