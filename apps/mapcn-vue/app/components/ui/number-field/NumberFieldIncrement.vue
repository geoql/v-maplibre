<script setup lang="ts">
  import type { NumberFieldIncrementProps } from 'reka-ui';
  import type { HTMLAttributes } from 'vue';
  import { reactiveOmit } from '@vueuse/core';
  import { NumberFieldIncrement, useForwardProps } from 'reka-ui';
  import { cn } from '@/lib/utils';

  const props = defineProps<
    NumberFieldIncrementProps & { class?: HTMLAttributes['class'] }
  >();

  const delegatedProps = reactiveOmit(props, 'class');

  const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <NumberFieldIncrement
    data-slot="increment"
    v-bind="forwarded"
    :class="
      cn(
        'absolute top-1/2 right-0 inline-flex size-10 -translate-y-1/2 items-center justify-center disabled:cursor-not-allowed disabled:opacity-20',
        props.class,
      )
    "
  >
    <slot>
      <Icon name="lucide:plus" class="size-4" />
    </slot>
  </NumberFieldIncrement>
</template>
