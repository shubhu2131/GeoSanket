self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  self.registration.showNotification(data.title || 'GeoSanket', {
    body: data.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'geosanket',
    requireInteraction: false,
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/citizen'))
})