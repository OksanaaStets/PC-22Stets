// sw.js - Service Worker для кешування ресурсів

const CACHE_NAME = 'schmalgauzen-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/images/Logo.png',
  '/images/Vlad.jpg',
  '/images/Roman.jpg',
  '/images/Matiukhin.jpg',
  '/images/Kiril.jpg',
  '/images/George.jpg',
  '/images/Jenia.jpg',
  '/images/Silence.jpg',
  '/images/Opera.jpg',
  '/images/Avgusto.jpg',
  '/images/Vill.jpg',
  
];

// Встановлення Service Worker і кешування ресурсів
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Кешування файлів');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Активація Service Worker і видалення старих кешів
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Очищення старого кешу');
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
        // Повернення кешованого ресурсу, якщо він є
        if (response) {
          return response;
        }
        
        // Копіювання запиту, оскільки запит може бути використаний тільки один раз
        const fetchRequest = event.request.clone();
        
        // Спроба отримати ресурс з мережі
        return fetch(fetchRequest).then(response => {
          // Перевірка, чи отримали валідну відповідь
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Копіювання відповіді для кешування
          const responseToCache = response.clone();
          
          // Відкриття кешу і збереження нової відповіді
          caches.open(CACHE_NAME)
            .then(cache => {
              // Кешування тільки статичних ресурсів (не API запити)
              if (event.request.url.indexOf('http') === 0) {
                cache.put(event.request, responseToCache);
              }
            });
            
          return response;
        });
      })
      .catch(() => {
        // Якщо мережа недоступна і кеш не має ресурсу, можна повернути fallback
        if (event.request.url.indexOf('.html') > -1 || 
            event.request.url === '/' || 
            event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        
        // Для зображень можна повернути заглушку
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return caches.match('/images/placeholder.png');
        }
      })
  );
});