
<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import InstanceQrModal from './InstanceQrModal.vue';
import InstanceDropDialog from './InstanceDropDialog.vue';
import repository from '../repositories/instances';
import { getQueryFromCurrentUrl } from '../utils/url';


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

const isMainInstance = computed(() => repository.mainInstanceData.name.toLowerCase() === model.value.name.toLowerCase());

const autoOpenQrModal = () => {
  const query = getQueryFromCurrentUrl();
  // Checamos que en el query string este definido que se abra el modal del qr (open=qr) ,
  // que nombre igual a la instancia actual (instance=model.name)
  // y que esta NO haya sido abierta
  console.log(model.value);
  const mustOpen =
    typeof query.open === 'string' &&
    query.open.toLowerCase() === 'qr' &&
    typeof model.value === 'object' &&
    model.value !== null &&
    typeof model.value.name === 'string' &&
    model.value.name !== '' &&
    typeof query.instance === 'string' &&
    query.instance !== '' &&
    query.instance.toLowerCase() === model.value.name.toLowerCase() &&
    !model.value.connected &&
    !qrModal.value;

  if (mustOpen) {
    qrModal.value = true;
  }
}

watch(isMainInstance, () => {
  autoOpenQrModal();
})

onMounted(() => {
  autoOpenQrModal();
})

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
const openQrModal = () => {
  qrModal.value = true;
}

const closeQrModal = () => {
  qrModal.value = false;
}

const getModel = (key) => {
  if (!key) {
    return model.value;
  }
  return model.value[key]
}

defineExpose({
  getModel,
  openQrModal,
  closeQrModal,
})

</script>
<template>
  <div class="max-w-sm overflow-hidden shadow-xl bg-white" style="border: 1px solid #e2e2e2;">
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
        class="bg-green-500 text-white active:bg-green-600 font-bold uppercase text-xs px-4 py-2 shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button"
        @click="$event => qrModal = true"
        v-show="model.connected !== true"
        >
        conectar
      </button>
      <button
        v-show="!isMainInstance"
        class="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-4 py-2 shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button"
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
