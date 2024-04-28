// Función para configurar el observador
function configurarObservador() {
  const contenedorPDF = document.getElementById('pdf-holder');
  if (contenedorPDF) {
    const observador = new MutationObserver(verificarURLArchivo);
    observador.observe(contenedorPDF, { childList: true, subtree: true });
    console.log('Se ha configurado el observador.');
  } else {
    console.log('El elemento contenedor de PDF no existe en esta página.');
  }
}

function verificarURLArchivo(listaMutaciones, observador) {
  console.log('Mutación observada:', listaMutaciones); // Registra la lista de mutaciones para depuración

  for (const mutacion of listaMutaciones) {
    if (mutacion.type === 'childList') {
      console.log('Se observó una mutación de tipo childList.');
      const contenedorPDF = document.getElementById('pdf-holder');
      // Comprobar tanto las URL de PDF como de MOBI
      const elementoURLArchivo = contenedorPDF.querySelector('[data-pdf-url], iframe.google-doc');

      if (elementoURLArchivo) {
        console.log('Se encontró un elemento de URL de archivo:', elementoURLArchivo);

        // Intentar obtener la URL, comprobando tanto los archivos PDF como MOBI
        let urlArchivo = elementoURLArchivo.getAttribute('data-pdf-url') || elementoURLArchivo.src;
        console.log('URL de archivo inicial:', urlArchivo);

        // Si la URL del archivo no es nula ni indefinida, proceder
        if (urlArchivo) {
          // Detectar si la URL es de Google Viewer y extraer la URL real del archivo si es necesario
          const coincidenciaGoogleViewer = urlArchivo.match(/url=([^&]+)/);
          urlArchivo = coincidenciaGoogleViewer ? decodeURIComponent(coincidenciaGoogleViewer[1]) : urlArchivo;
          // Enviar la URL del archivo al script de fondo
          chrome.runtime.sendMessage({accion: "abrirPestaña", url: urlArchivo});
          observador.disconnect(); // Desconectar el observador si no se necesita más
          console.log('URL del archivo encontrada y enviada al script de fondo:', urlArchivo);
        } else {
          console.log('No se encontró la URL del archivo o no es válida.');
        }
      } else {
        console.log('No se encontró ningún elemento de URL de archivo dentro del contenedor de PDF.');
      }
    }
  }
}

// Intercepta las solicitudes de red para atrapar archivos EPUB
function interceptarArchivosEPUB() {
  const fetchOriginal = window.fetch;
  window.fetch = function(...args) {
    if (typeof args[0] === 'string') {
      console.log('Se detectó una solicitud fetch, URL:', args[0]);
      if (args[0].startsWith('https://stream2.docer.com.ar/pdf_dummy/')) {
        console.log('Solicitud fetch para archivo EPUB interceptada:', args[0]);
        chrome.runtime.sendMessage({ accion: "abrirPestaña", url: args[0] });
      }
    }
    return fetchOriginal.apply(this, args);
  };
  console.log('Las solicitudes fetch ahora están siendo interceptadas para archivos EPUB.');
}

// Espera a que el DOM se cargue completamente antes de intentar configurar el observador
if (document.readyState === "complete" || document.readyState === "interactive") {
  console.log('El DOM está listo. Configurando el observador e interceptación de fetch.');
  configurarObservador();
  interceptarArchivosEPUB();
} else {
  console.log('El DOM no está completamente cargado. Se configurará el observador e interceptación de fetch cuando esté listo.');
  window.addEventListener('DOMContentLoaded', () => {
    configurarObservador();
    interceptarArchivosEPUB();
  });
}