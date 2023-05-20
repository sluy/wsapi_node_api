
<script setup>
import { computed, watch, ref } from 'vue';
import { api } from '../utils/api';
import { isAxiosError } from 'axios';

import ModalWindow from './ModalWindow.vue';
import { redirectToMain } from '../utils/url';

const props = defineProps({
  modelValue: Object,
  open: Boolean
});
const emit = defineEmits(['dropped', 'error', 'update:open']);
const errorMessage = ref(null);

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});
const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

watch(model, () => {
  errorMessage.value = false;
});

const drop = async () => {
  try {
    const res = await api.patch('instances', {
      value: model.value.id,
      field: 'id'
    });
    emit('dropped', res);
    redirectToMain();
  } catch (error) {
    if (isAxiosError(error) && typeof error.response && typeof error.response.data === 'object' && error.response.data !== null && typeof error.response.message === 'string') {
      error.value = error.response.data.message;
    } else {
      error.value = 'internal';
    }
    emit('error', error);
  }
}
</script>
<template>
  <ModalWindow v-model="isOpen" title="Eliminar Instancia">
    <template v-slot:actions>
      <button
        class="bg-red-500 text-white active:bg-red-500 font-bold uppercase text-xs px-4 py-2  hover:bg-red-600 outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button" @click="drop()">
        Eliminar
      </button>
    </template>
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-5" role="alert"
      v-if="errorMessage">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">
        <span v-if="errorMessage === 'instance.save.error.name.invalid'">El nombre es obligatorio.</span>
        <span v-else-if="errorMessage === 'instance.save.error.name.exists'">Ya tiene una instancia registrada con ese
          nombre.</span>
        <span v-else-if="errorMessage === 'instance.save.error.api.wrong'">Ocurrió un error al guardar en la API. Contacte
          con el personal de soporte sobre este error.</span>
        <span v-else>Ha ocurrido un error interno, intente de nuevo luego.</span>
      </span>
    </div>
    <div class="mb-4">
      ¿Estás seguro que deseas reiniciar la instancia <b>{{  model.name }}</b>?.<br> Después de aceptar se eliminara la vinculación del dispositivo.
    </div>
  </ModalWindow>
</template>
