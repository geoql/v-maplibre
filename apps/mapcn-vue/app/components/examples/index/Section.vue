<script setup lang="ts">
  import type {
    Example,
    ExampleCategory,
    ExampleSubsection,
  } from '~/types/examples';
  import { useClipboard } from '@vueuse/core';
  import { slugify } from '~/lib/utils';

  const props = defineProps<{
    category: ExampleCategory;
  }>();

  const router = useRouter();
  const requestUrl = useRequestURL();
  const { copy } = useClipboard();

  const categorySlug = computed(() => slugify(props.category.title));

  const grouped = computed<ExampleSubsection[]>(() => {
    const hasSubsections = props.category.examples.some(
      (e) => typeof e.subsection === 'string' && e.subsection.length > 0,
    );

    if (!hasSubsections) {
      return [{ label: null, examples: props.category.examples }];
    }

    const buckets = new Map<string, Example[]>();
    const seenOrder: string[] = [];
    const others: Example[] = [];

    for (const example of props.category.examples) {
      const key = example.subsection;
      if (typeof key === 'string' && key.length > 0) {
        if (!buckets.has(key)) {
          buckets.set(key, []);
          seenOrder.push(key);
        }
        buckets.get(key)!.push(example);
      } else {
        others.push(example);
      }
    }

    const order = props.category.subsectionOrder ?? seenOrder;
    const sorted = [...order, ...seenOrder.filter((k) => !order.includes(k))];

    const result: ExampleSubsection[] = sorted
      .filter((label) => buckets.has(label))
      .map((label) => ({ label, examples: buckets.get(label)! }));

    if (others.length > 0) {
      result.push({ label: 'Other', examples: others });
    }

    return result;
  });

  function subsectionId(label: string): string {
    return `${categorySlug.value}-${slugify(label)}`;
  }

  function copyAnchor(id: string): void {
    void router.push({ hash: `#${id}` });
    void copy(`${requestUrl.origin}${requestUrl.pathname}#${id}`);
  }
</script>

<template>
  <section :id="categorySlug" class="scroll-mt-24">
    <div class="group/heading mb-8 flex items-center gap-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/30"
      >
        <Icon :name="category.icon" class="size-5 text-primary" />
      </div>

      <div class="flex-1">
        <h2
          class="flex items-center gap-2 text-xl font-semibold tracking-tight"
        >
          <a
            :href="`#${categorySlug}`"
            class="hover:underline"
            @click.prevent="copyAnchor(categorySlug)"
          >
            {{ category.title }}
          </a>
          <button
            :aria-label="`Copy link to ${category.title}`"
            class="opacity-0 transition-opacity group-hover/heading:opacity-100 focus-visible:opacity-100"
            @click="copyAnchor(categorySlug)"
          >
            <Icon
              name="lucide:link"
              class="size-3.5 text-muted-foreground hover:text-foreground"
            />
          </button>
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ category.description }}
        </p>
      </div>

      <div
        class="hidden rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground md:block"
      >
        {{ category.examples.length }} examples
      </div>
    </div>

    <div class="space-y-10">
      <div
        v-for="group in grouped"
        :id="group.label ? subsectionId(group.label) : undefined"
        :key="group.label ?? '__flat__'"
        class="scroll-mt-24"
      >
        <div v-if="group.label" class="group/sub mb-4 flex items-center gap-3">
          <a
            :href="`#${subsectionId(group.label)}`"
            class="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase hover:text-foreground"
            @click.prevent="copyAnchor(subsectionId(group.label))"
          >
            {{ group.label }}
            <Icon
              name="lucide:link"
              class="size-3 opacity-0 transition-opacity group-hover/sub:opacity-100 focus-visible:opacity-100"
            />
          </a>
          <span
            class="h-px flex-1 bg-gradient-to-r from-border/60 via-border/20 to-transparent"
          />
          <span
            class="rounded-sm border border-border/50 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground"
          >
            {{ group.examples.length }}
          </span>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ExamplesIndexCard
            v-for="example in group.examples"
            :key="example.href"
            :example="example"
          />
        </div>
      </div>
    </div>
  </section>
</template>
