/**
 * =========================================================================
 * SERVICE WORKER • SÃO JOSÉ BURGUER PWA & OFFLINE ENGINE
 * Garante abertura instantânea, cache inteligente e proteção contra quedas.
 * =========================================================================
 */

const CACHE_NAME = 'sao-jose-burguer-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/menu_data.json',
  '/manifest.json',
  '/assets/supabase-client.js',
  '/assets/906da31e40b234ed_s_C3_A3o_20jose_20burguer17365.webp',
  '/assets/e8392808a1c7659c_favicon.png',
  '/assets/pedreiras_trizidela_map_data.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Anton&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap'
];

// Instalação: pré-cache dos arquivos essenciais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('⚡ [Service Worker] Pré-carregando arquivos essenciais do São José Burguer...');
      return cache.addAll(PRECACHE_ASSETS).catch(err => console.warn('Erro parcial no cache:', err));
    }).then(() => self.skipWaiting())
  );
});

// Ativação: limpeza de versões antigas do cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🧹 [Service Worker] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de Requisições (Stale-While-Revalidate & Cache-First)
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignorar requisições de analytics, realtime ou POST/PUT
  if (req.method !== 'GET' || url.protocol.startsWith('chrome-extension') || url.hostname.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(req).then(cachedResponse => {
        // Tentar buscar na rede para atualizar o cache em segundo plano (Stale-While-Revalidate)
        const fetchPromise = fetch(req)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(req, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Se falhar a rede e tiver cache, usa o cache
            return cachedResponse;
          });

        // Se já tiver no cache, retorna imediatamente para velocidade máxima; se não, espera a rede
        return cachedResponse || fetchPromise;
      });
    })
  );
});
