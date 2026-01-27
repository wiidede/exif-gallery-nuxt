<script setup lang="ts">
import type { NumberFieldRootEmits, NumberFieldRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { NumberFieldRoot, useForwardPropsEmits } from 'reka-ui'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<NumberFieldRootProps & {
  class?: HTMLAttributes['class']
  inputClass?: HTMLAttributes['class']
}>()
const emits = defineEmits<NumberFieldRootEmits>()

const delegatedProps = computed(() => {
  const { class: _c, inputClass: _i, ...delegated } = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <NumberFieldRoot v-bind="forwarded" :class="cn('grid gap-1.5', props.class)">
    <slot>
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput :class="inputClass" />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </slot>
  </NumberFieldRoot>
</template>
