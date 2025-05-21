// Код для реєстрації Service Worker

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/PC-22Stets/sw.js')
      .then(registration => {
        console.log('Service Worker зареєстровано успішно:', registration.scope);
      })
      .catch(error => {
        console.log('Реєстрація Service Worker не вдалась:', error);
      });
  });
}