<script setup>
import { computed } from 'vue';
const props = defineProps({
  modelValue: Boolean,
  title: String,
  hideCloseBtn: Boolean
})
const emit = defineEmits(['update:modelValue']);
const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

</script>
<template>
  <div class="container mx-auto">
    <div class="flex justify-center">
      <div v-show="model" class="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-gray-700 bg-opacity-50
            ">
        <div class="max-w-2xl p-3 mx-4 bg-white rounded-md shadow-xl">
          <slot name="header">
            <div class="flex items-center justify-left">
              <h3 class="text-2xl">
                <slot name="title">{{ props.title }}</slot>
              </h3>
            </div>
          </slot>
          <slot name="content">
            <div class="mt-10 mb-5" style="width: 500px;max-width:100%;">
              <slot></slot>
            </div>
          </slot>
          <slot name="footer">
            <div class="text-right">
              <button
                v-if="hideCloseBtn !== true"
                class="text-black active:text-black font-bold uppercase text-xs px-4 py-2  hover:text-red outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button" @click="$event => model = false">
                cerrar
              </button>
              <slot name="actions"></slot>
            </div>
          </slot>
         </div>
      </div>
    </div>
  </div>
</template>
