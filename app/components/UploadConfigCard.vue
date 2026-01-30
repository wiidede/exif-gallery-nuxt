<script setup lang="ts">
const cardRef = useTemplateRef('cardRef')
const configuring = ref(false)
onClickOutside(cardRef, () => {
  configuring.value = false
})
</script>

<template>
  <Card
    ref="cardRef"
    class="group relative p-4"
    :class="{ 'cursor-pointer': !configuring }"
    @click="configuring = true"
  >
    <ClientOnly>
      <Collapsible v-model:open="configuring">
        <CollapsibleTrigger v-show="!configuring">
          <div class="flex flex-wrap gap-2">
            <slot name="status" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="flex flex-col gap-2">
            <slot name="config" />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </ClientOnly>
    <div class="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
      <div v-show="!configuring" class="i-lucide-cog absolute bottom--4 right--2 text-6xl op-20 group-hover:animate-spin animate-duration-2000!" />
    </div>
  </Card>
</template>
