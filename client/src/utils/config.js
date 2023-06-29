export default {
  client_id: parseInt(document.getElementById('wsapi_app').dataset.clientId.trim()),
  //apiUrl: 'http://127.0.0.1:8000'
  api: {
    url: 'https://wchat.neo.sx',
    secret: '',
    proxy: {
      status: true,
      url: window.location.protocol + '//' + window.location.hostname + '/?ruta=wsapi',
      method: 'post'
    }
  },
  socket: {
    url: 'https://wchat.neo.sx'
  }
}