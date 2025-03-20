/**
 * Archivo de optimizaciones generales para mejorar el rendimiento del sitio
 */

// Función para carga perezosa de imágenes
function habilitarCargaPerezosa() {
  // Verificar si el navegador admite IntersectionObserver
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          
          // Reemplazar el src con el valor de data-src
          if (image.dataset.src) {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
          }
          
          // Desconectar el observer una vez cargada la imagen
          observer.unobserve(image);
        }
      });
    });

    // Seleccionar todas las imágenes que tengan data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback para navegadores que no soportan IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// Función para limitar las llamadas a funciones intensivas (throttling)
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Función para optimizar eventos de scroll
function optimizarEventosScroll() {
  const scrollHandler = throttle(function() {
    // Aquí va el código que se ejecutará durante el scroll
    // Por ejemplo, animaciones, carga de elementos, etc.
  }, 100); // Ejecutar como máximo cada 100ms

  window.addEventListener('scroll', scrollHandler);
}

// Función para precargar recursos críticos
function precargarRecursos() {
  // Lista de recursos críticos a precargar
  const recursosACarga = [
    'CssFinal/navBar.css',
    'CssFinal/allcolors.css',
    'ImgFinal/LogoNavBar.png'
  ];

  // Precargar cada recurso
  recursosACarga.forEach(recurso => {
    const estiloOLink = recurso.endsWith('.css') ? 'style' : 'link';
    
    if (estiloOLink === 'style') {
      const linkElement = document.createElement('link');
      linkElement.rel = 'preload';
      linkElement.href = recurso;
      linkElement.as = 'style';
      document.head.appendChild(linkElement);
    } else {
      const linkElement = document.createElement('link');
      linkElement.rel = 'preload';
      linkElement.href = recurso;
      linkElement.as = 'image';
      document.head.appendChild(linkElement);
    }
  });
}

// Función para eliminar scripts y estilos no utilizados
function limpiarRecursosNoUtilizados() {
  // Obtener todos los scripts y hojas de estilo
  const scripts = Array.from(document.getElementsByTagName('script'));
  const styles = Array.from(document.getElementsByTagName('link'))
                      .filter(link => link.rel === 'stylesheet');
  
  // Eliminar scripts no utilizados (esto debe personalizarse según el sitio)
  scripts.forEach(script => {
    if (script.src && script.src.includes('analytics') && !window.location.href.includes('admin')) {
      script.remove();
    }
  });
  
  // Eliminar estilos no utilizados en páginas específicas
  if (!window.location.href.includes('graficas.html')) {
    styles.forEach(style => {
      if (style.href && style.href.includes('graficas')) {
        style.disabled = true;
      }
    });
  }
}

// Inicializar optimizaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  habilitarCargaPerezosa();
  optimizarEventosScroll();
  precargarRecursos();
  
  // Ejecutar limpieza después de que todo esté cargado
  window.addEventListener('load', limpiarRecursosNoUtilizados);
});

// Exportar funciones para uso en otros archivos
export {
  habilitarCargaPerezosa,
  throttle,
  optimizarEventosScroll,
  precargarRecursos,
  limpiarRecursosNoUtilizados
}; 