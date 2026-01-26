<script setup lang="ts"></script>

<template>
  <div class="fixed inset-0 -z-10">
    <div class="absolute inset-0 bg-background"></div>
    <div
      class="animate-aurora-1 absolute -top-[30%] -left-[40%] size-[80%] rounded-full bg-linear-to-br from-primary/20 via-cyan-500/10 to-transparent blur-3xl"
    ></div>
    <div
      class="animate-aurora-2 absolute top-[20%] -right-[30%] size-[60%] rounded-full bg-linear-to-bl from-violet-500/15 via-primary/10 to-transparent blur-3xl"
    ></div>
    <div
      class="animate-aurora-3 absolute -bottom-[20%] left-[20%] size-[50%] rounded-full bg-linear-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl"
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
