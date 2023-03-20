
<script setup>
import { computed, watch, ref } from 'vue';
import { api } from '../utils/api';
import { isAxiosError } from 'axios';

import ModalWindow from './ModalWindow.vue';

const props = defineProps({
  modelValue: Object,
  open: Boolean
});
const emit = defineEmits(['saved', 'error', 'update:open']);
const errorMessage = ref(null);

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});
const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

watch(model.value, () => {
  console.log('changed!');
  errorMessage.value = null;
});

const save = async () => {
  try {
    const res = await api.post('instances', model.value);
    emit('saved', res);
  } catch (error) {
    if (isAxiosError(error) && typeof error.response && typeof error.response.data === 'object' && error.response.data !== null && typeof error.response.data.message === 'string') {
      console.log(error.response.data.message);
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'internal';
    }
    emit('error', error);
  }
}
</script>
<template>
  <ModalWindow v-model="isOpen" :title="model.id ? 'Editar instancia' : 'Nueva instancia'">
    <template v-slot:actions>
      <button
        class="bg-blue-500 text-white active:bg-blue-500 font-bold uppercase text-xs px-4 py-2  hover:bg-blue-600 outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button" @click="save()">
        Guardar
      </button>
    </template>
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-5" role="alert" v-if="errorMessage">
        <strong class="font-bold">Error: </strong>
        <span class="block sm:inline">
          <span v-if="errorMessage === 'instance.save.error.name.invalid'">El nombre es obligatorio.</span>
          <span v-else-if="errorMessage === 'instance.save.error.name.exists'">Ya tiene una instancia registrada con ese nombre.</span>
          <span v-else-if="errorMessage === 'instance.save.error.api.wrong'">Ocurrió un error al guardar en la API. Contacte con el personal de soporte sobre este error.</span>
          <span v-else>Ha ocurrido un error interno, intente de nuevo luego.</span>
        </span>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="wsapi_instance_store_name">
          Nombre *
        </label>
        <input
          class=" appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          :value="model.name"
          @input="event => model.name = event.target.value"
          @keyup.enter="save()"
          id="wsapi_instance_store_name" type="text" placeholder="Mi instancia"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="wsapi_instance_store_info">
          Información adicional
        </label>
        <textarea
          class=" appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          :value="model.info"
          @input="event => model.info = event.target.value"
          @keyup.enter="save()"
          id="wsapi_instance_store_info" type="text" placeholder="Opcional"
        />
      </div>
  </ModalWindow>
</template>
