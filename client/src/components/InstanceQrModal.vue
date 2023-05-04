
<script setup>
import { computed, ref, watch } from 'vue';
import { socket } from '../utils/io';
import { api } from '../utils/api';

import config from '../utils/config';

const props = defineProps({
  instance: Object,
  open: Boolean,
})

const emit = defineEmits(['update:open', 'update:instance', 'loaded']);
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

watch(isOpen, (value) => {
  if (value) {
    loadQR();
  }
});

const QR = ref(null);

const done = () => {
  console.log('emitiendo loaded');
  emit('loaded', props.instance);
}

const loadQR = async () => {
  if (!isOpen.value) {
    return;
  }
  try {
    const res = await api.get('instances/qr', { 'value': model.value.id, 'field': 'id' });
    console.log('LA RESPUESTA DE QR', res);
    if (typeof res === 'object' && res !== null && typeof res.data === 'object' && res.data !== null && typeof res.data.qr_src === 'string') {
      QR.value = res.data.qr_src;
      return;
    }
  } catch (error) {
    //Err
  }
  QR.value = null;
}

const isCurrentInstance = (payload) => {
  return isOpen.value === true &&
    typeof payload === 'object' && payload !== null &&
    payload.instance_id === model.value.code;
}


socket.on(config.client_id + '.wsapi.webhook.qr', (payload) => {
  if (isCurrentInstance(payload)) {
    loadQR();
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
socket.on(config.client_id + '1.wsapi.webhook.loading_screen', (payload) => {
  if (isCurrentInstance(payload)) {
    step.value = 'loading_screen';
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
            <h3 class="text-center" style="font-size: 20px !important;">Conectar Instancia</h3>
          </div>
          <div class="mt-10 mb-4 text-center" style="width: 500px;max-width:100%;">
            <div v-if="step === 'scan'">
              <div v-if="typeof QR === 'string' && QR !== ''">
                <p>Abra la aplicación <b>WhatsApp</b> desde su dispositivo móvil<br>
                  <b>Whatsapp -> Dispositivos Vinculados -> Vincular Dispositivo</b><br>
                  Posteriormente escanee el código QR mostrado a continuación:
                </p>
                <img v-bind:src="QR"
                  class="inline mt-10"
                  style="height: 300px; width:300px;"/>
              </div>
              <div v-else>
                <img class="inline mt-10" src="/images/spinner.gif" />
              </div>
            </div>
            <div v-else-if="step === 'authenticated'">
              <p>
                Autenticado ...
              </p>
              <img class="inline mt-10" src="/images/spinner.gif" />
            </div>
            <div v-else-if="step === 'loading_screen'">
              <p>
                Cargando información de chats...
              </p>
              <img class="inline mt-10" src="/images/spinner.gif" />
            </div>
            <div v-else-if="step === 'ready'">
              ¡Instancia cargada exitosamente!
              <div class="text-center">
                <button @click="done()" class="px-6 py-2 mt-6 text-blue-800 border border-blue-600 rounded">
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
