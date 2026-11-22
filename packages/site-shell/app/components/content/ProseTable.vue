<template>
  <!-- Wide tables scroll inside their own box instead of widening the page
       on phones. -->
  <div class="my-6 overflow-x-auto">
    <table>
      <slot></slot>
    </table>
  </div>
</template>
