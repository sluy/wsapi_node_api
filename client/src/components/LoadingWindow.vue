<script setup>
import { computed } from 'vue';
const props = defineProps({
  msg: {
    type: String,
    required: false,
    default: ''
  },
  color: {
    type: String,
    required: false,
    default: 'rgba(255,255,255,0.5)'
  },
  textColor: {
    type: String,
    required: false,
    default: '#222'
  },
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

</script>
<template>
  <div class="items-center justify-center top-0 left-0 absolute z-50 h-full w-full"
    v-bind:style="{
      color: props.textColor,
      background: props.color
    }"
    v-bind:class="(model === true) ? 'flex' : 'hidden'"
    >
    <div class="text-center">
      <img src="../assets/spinner.gif"/>
      <h6 v-show="props.msg && props.msg.trim() !== ''" v-html="props.msg"/>
    </div>
  </div>
</template>
