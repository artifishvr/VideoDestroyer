<script>
  import "../app.css"; // Supports weights 100-900
  import "@fontsource-variable/dm-sans";
  import { Toaster } from "$lib/components/ui/sonner";
  import { onMount } from "svelte";

  onMount(() => {
    const analyticsScript = document.createElement("script");
    analyticsScript.defer = true;
    analyticsScript.dataset.domain = "destroy.arti.lol";
    analyticsScript.src = "https://a.arti.lol/js/script.js";
    document.head.appendChild(analyticsScript);
  });
</script>

<Toaster />

<slot></slot>
