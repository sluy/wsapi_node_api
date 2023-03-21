
<script setup>
import { computed, ref } from 'vue';
import InstanceQrModal from './InstanceQrModal.vue';
import InstanceDropDialog from './InstanceDropDialog.vue';

const props = defineProps({
  instance: Object,
})
const emit = defineEmits(['update:instance', 'dropped', 'qr-load', 'change']);
const qrModal = ref(false);
const dropModal = ref(false);

const model = computed({
  get: () => props.instance,
  set: (value) => emit('update:instance', value)
});

const onDrop = (res) => {
  dropModal.value = false;
  qrModal.value = false;
  emit('change', res);
  emit('dropped', res);
}

const onQrLoad = (res) => {
  console.log('qr cargado, emitiendo change');
  qrModal.value = false;
  emit('qr-load', res);
  emit('change', res);
}

</script>
<template>
  <div class="max-w-sm rounded overflow-hidden shadow-xl">
    <div class="px-6 py-4">
      <div class="font-bold text-xl mb-2">{{ props.instance.name }}</div>
      <p class="text-gray-400 text-base" v-if="typeof props.instance.info === 'string' && props.instance.info.trim() !== ''">
        {{  props.instance.info  }}
      </p>
      <p class="text-gray-400 text-base" v-else>
        Sin información adicional.
      </p>
    </div>
    <div class="px-6 pt-4 pb-2 text-right">
      <button
        class="bg-green-500 text-white active:bg-green-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button"
        @click="$event => qrModal = true"
        v-show="model.connected !== true"
        >
        conectar
      </button>
      <button
        class="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button"
        @click="$event => dropModal = true"
        >
        eliminar
      </button>
      <!--
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
      <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#winter</span>
      -->
    </div>
  </div>
  <InstanceQrModal v-model:open="qrModal" v-model:instance="model" v-on:loaded="onQrLoad"/>
  <InstanceDropDialog v-model="model" v-model:open="dropModal" @dropped="onDrop" />
</template>
