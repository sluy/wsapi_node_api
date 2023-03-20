
<script setup>
import { computed, ref } from 'vue';
import { socket } from '../utils/io';
import config from '../utils/config';

const props = defineProps({
  instance: Object,
  open: Boolean,
})

const emit = defineEmits(['update:open', 'update:instance']);
const step = ref('scan');

const model = computed({
  get: () => props.instance,
  set: (value) => emit('update:instance', value)
});
const isOpen = computed({
  get: () => props.open,
  set: (value) => {
    emit('update:open', value);
  }
})

const isCurrentInstance = (payload) => {
  return typeof payload === 'object' &&
    payload !== null &&
    payload.instance_id === model.value.code && isOpen.value === true;
}
const mustUpdateQR = (payload) => {
  return isCurrentInstance(payload) &&
    typeof payload.data === 'object' &&
    payload.data !== null &&
    typeof payload.data.base64 === 'string' &&
    payload.data.base64 !== '' &&
    typeof payload.data.qr === 'string' &&
    payload.data.qr !== '' &&
    payload.data.qr_src !== model.value.qr_src;
}

socket.on(config.client_id + '.wsapi.webhook.qr', (payload) => {
  if (mustUpdateQR(payload)) {
    model.value.qr = payload.data.qr;
    model.value.qr_src = payload.data.base64;
    console.log('qr changed');
    return;
  }
});

socket.on(config.client_id + '.wsapi.webhook.ready', (payload) => {
  if (isCurrentInstance(payload)) {
    step.value = 'ready';
  }
});

socket.on(config.client_id + '.wsapi.webhook.authenticated', (payload) => {
  if (isCurrentInstance(payload)) {
    step.value = 'authenticated';
  }
});
socket.on(config.client_id + '.wsapi.webhook.loading.screen', (payload) => {
  if (isCurrentInstance(payload)) {
    step.value = 'loading.screen';
  }
});

</script>

<template>
  <div class="container mx-auto">
    <div class="flex justify-center">
      <div v-show="isOpen" class="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-gray-700 bg-opacity-50
          ">
        <div class="max-w-2xl p-6 mx-4 bg-white rounded-md shadow-xl">
          <div class="flex items-center justify-center">
            <h3 class="text-2xl text-center">Conectar Instancia</h3>
          </div>
          <div class="mt-10 mb-4 text-center" style="width: 500px;max-width:100%;">
            <div v-if="step === 'scan'">
              <p>Abra la aplicación <b>WhatsApp</b> desde su dispositivo móvil<br>
              <b>Whatsapp -> Dispositivos Vinculados -> Vincular Dispositivo</b><br>
              Posteriormente escanee el código QR mostrado a continuación:
              </p>
              <div v-if="typeof model.qr_src === 'string' && model.qr_src !== ''">
                <img v-bind:src="model.qr_src"
                  class="inline mt-10"
                  style="height: 300px; width:300px;display:inline-block;"/>
              </div>
            </div>
            <div v-else-if="step === 'autenticated'">
              Ya estamos casi listos, por favor espere...
            </div>
            <div v-else-if="step === 'loading.screen'">
              Cargando la información de los chats...
            </div>
            <div v-else-if="step === 'ready'">
              ¡Instancia cargada exitosamente!
              <div class="text-center">
                <button @click="isOpen = false" class="px-6 py-2 mt-6 text-blue-800 border border-blue-600 rounded">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
