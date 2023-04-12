<script setup>
import repository from '../repositories/instances';
import InstanceCard from './InstanceCard.vue';
import InstanceEditor from './InstanceEditor.vue';

import { onMounted, ref } from 'vue';
//import { cloneDeep } from 'lodash';

let instances = ref([]);
let instanceCards = ref([]);
let loaded = ref(false);
let error = ref(false);

const editor = ref({
  open: false,
  model: {}
});

const loadAll = async () => {
  try {
    instances.value = await repository.all();
    console.log('RECUPERANDO', instances.value);
    loaded.value = true;
  } catch (error) {
    console.log('Ocurrió error amigo');
    error.value = true
  }
}
onMounted(() => {
  loadAll();
});

const createInstance = () => {
  editor.value.model = {
    name: '',
    info: ''
  };
  editor.value.open = true;
}

const onSave = () => {
  loadAll();
  editor.value.open = false;
}


</script>

<template>
    <div class="text-right pb-5" v-if="loaded && !error && instances.length > 0">
      <button
        class="bg-gray-200 text-gray-700 active:bg-gray-200 font-bold uppercase text-xs px-4 py-2 shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button"
        @click="loadAll()"
        >
        actualizar lista
      </button>
    </div>
    <div class="">
      <div v-if="error">
        Ocurrió un error al cargar las instancias.<br>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4" @click="loadAll">
          Reintentar
        </button>
      </div>
      <div v-else-if="loaded">
        <div v-if="instances.length === 0" class="text-center py-5">
          <p class="pb-5">
            No tienes instancias de <b>WhatsApp</b> registradas.
          </p>
          <button
          class="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-xs px-4 py-2 shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button"
          @click="createInstance()"
          >
          crear instancia
        </button>
        </div>
        <div v-else class="grid xs:grid-cols-1 xs:gap-1 sm:grid-cols-1 sm:gap-1 md:grid-cols-2 md:gap-2 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4 xl:gap-4 xl2:grid-cols-5 md:gap-5">
          <div >
            <InstanceCard
              v-model:instance="instances[index]"
              v-on:change="loadAll"
              v-for="(instance, index) of instances"
              v-bind:key="'instance-card-' + index"
              :ref="el => instanceCards.push(el)"
              />
          </div>
        </div>
      </div>
    </div>
    <InstanceEditor v-model="editor.model" v-model:open="editor.open" @saved="onSave" />
</template>

<style scoped>
</style>
