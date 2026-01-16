<script setup lang="ts"></script>

<template>
  <div class="fixed inset-0 -z-10">
    <div class="absolute inset-0 bg-background"></div>
    <div
      class="absolute -left-[40%] -top-[30%] h-[80%] w-[80%] animate-aurora-1 rounded-full bg-linear-to-br from-primary/20 via-cyan-500/10 to-transparent blur-3xl"
    ></div>
    <div
      class="absolute -right-[30%] top-[20%] h-[60%] w-[60%] animate-aurora-2 rounded-full bg-linear-to-bl from-violet-500/15 via-primary/10 to-transparent blur-3xl"
    ></div>
    <div
      class="absolute -bottom-[20%] left-[20%] h-[50%] w-[50%] animate-aurora-3 rounded-full bg-linear-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl"
    ></div>
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,rgb(128_128_128/0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgb(128_128_128/0.03)_1px,transparent_1px)] bg-size-[60px_60px]"
    ></div>
    <div
      class="absolute inset-0 opacity-[0.015] mix-blend-overlay"
      style="
        background-image: url('data:image/svg+xml,%3Csvg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;noise&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.65&quot; numOctaves=&quot;3&quot; stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23noise)&quot;/%3E%3C/svg%3E');
      "
    ></div>
  </div>
</template>
