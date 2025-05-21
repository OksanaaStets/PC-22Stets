// sw.js - Service Worker для кешування ресурсів

const CACHE_NAME = 'schmalgauzen-cache-v2'; // ЗМІНІТЬ ВЕРСІЮ КЕШУ! Це дуже важливо, щоб Service Worker оновився.
const URLS_TO_CACHE = [
  '/PC-22Stets/', // Це кореневий URL вашого проекту на GitHub Pages
  '/PC-22Stets/index.html', // Шлях до вашого основного HTML-файлу
  '/PC-22Stets/styles.css', // Шлях до вашого CSS-файлу
  '/PC-22Stets/images/Logo.png',
  '/PC-22Stets/images/Vlad.jpg',
  '/PC-22Stets/images/Roman.jpg',
  '/PC-22Stets/images/Matiukhin.jpg',
  '/PC-22Stets/images/Kiril.jpg',
  '/PC-22Stets/images/George.jpg',
  '/PC-22Stets/images/Jenia.jpg',
  '/PC-22Stets/images/Silence.jpg',
  '/PC-22Stets/images/Opera.jpg',
  '/PC-22Stets/images/Avgusto.jpg',
  '/PC-22Stets/images/Vill.jpg',
  '/PC-22Stets/favicon.ico', 
  '/PC-22Stets/site.webmanifest', 
  '/PC-22Stets/main.js', 
];

// Встановлення Service Worker і кешування ресурсів
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Кешування файлів');
        // Додаємо console.error для кращої діагностики помилки
        return cache.addAll(URLS_TO_CACHE).catch(error => {
          console.error('Service Worker: Помилка при кешуванні одного з файлів:', error);
          // Ви можете видалити проблемний URL зі списку URLS_TO_CACHE, якщо він не є критичним
          // або виправити сам URL
          throw error; // Повторно викидаємо помилку, щоб install не вдався
        });
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Service Worker: Помилка під час встановлення:', error);
      })
  );
});

// Активація Service Worker і видалення старих кешів
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Очищення старого кешу:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехоплення запитів і використання кешу, якщо можливо
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              if (event.request.url.startsWith('http')) { // Використовуйте startsWith для більшої точності
                 cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // Якщо мережа недоступна і кеш не має ресурсу, можна повернути fallback
        // Перевірте, чи існують ці файли на вашому сервері
        if (event.request.url.includes('.html') ||
            event.request.url === '/PC-22Stets/' || // Для кореневого URL вашого сайту
            event.request.mode === 'navigate') {
          return caches.match('/PC-22Stets/offline.html'); // Шлях до вашої офлайн-сторінки
        }

        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return caches.match('/PC-22Stets/images/placeholder.png'); // Шлях до вашої заглушки зображень
        }
      })
  );
});