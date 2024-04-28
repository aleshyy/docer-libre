// Conjunto para llevar un registro de las URL procesadas
const urlsProcesadas = new Set();

// Agregar un listener para mensajes del runtime de Chrome
chrome.runtime.onMessage.addListener((mensaje, remitente, enviarRespuesta) => {
  if (mensaje.accion === "abrirPestaña" && mensaje.url) {
    chrome.tabs.create({ url: mensaje.url });
  }
});

// Listener para las solicitudes web completadas con el patrón de URL especificado
chrome.webRequest.onCompleted.addListener(
  function(detalle) {
    console.log('Solicitud completada a la URL:', detalle.url);

    // Verificar si la URL coincide con el patrón esperado y no ha sido procesada
    if ((detalle.url.includes('pdf_dummy') || detalle.url.includes('getpdf') || detalle.url.includes('/getepub/')) && !urlsProcesadas.has(detalle.url)) {
      console.log('Detectada la solicitud de descarga de archivo EPUB. Abriendo en una nueva pestaña:', detalle.url);

      // Agregar la URL al conjunto de URLs procesadas
      urlsProcesadas.add(detalle.url);

      // Abrir la URL en una nueva pestaña
      chrome.tabs.create({ url: detalle.url });
    }
  },
  // Filtro de URL para el listener
  { urls: ["https://stream2.docer.com.ar/pdf_dummy/*", "https://stream.docer.com.ar/getpdf/*", "https://stream.docer.com.ar/getepub/*"] },
);