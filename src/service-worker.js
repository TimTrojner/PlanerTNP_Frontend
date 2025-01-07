import { clientsClaim } from 'workbox-core'
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', async () => {
//     const registration = await navigator.serviceWorker.register('./sw.js')
//     console.log('Service worker registered for scope', registration.scope)
//
//     await registerPeriodicBackgroundSync(registration)
//   })
// }

// declare const self: ServiceWorkerGlobalScope & Window

clientsClaim()

// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST)

const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$')
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false
    }
    if (url.pathname.startsWith('/_')) {
      return false
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false
    }
    return true
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
)

const schedulesListName = 'schedules-list'
self.addEventListener('activate', (event) => {
  event.waitUntil(
    new Promise((resolve, reject) => {
      let openRequest = indexedDB.open(schedulesListName, 1)

      openRequest.onupgradeneeded = function () {
        let db = openRequest.result
        if (!db.objectStoreNames.contains('schedules')) {
          db.createObjectStore('schedules', {
            keyPath: 'id',
            autoIncrement: true,
          })
        }
      }

      openRequest.onsuccess = function () {
        resolve(openRequest.result)
      }

      openRequest.onerror = function () {
        reject(openRequest.error)
      }
    })
  )
})

const updateSchedulesDB = (url) => {
  let openRequest = indexedDB.open(schedulesListName, 1)

  openRequest.onsuccess = function () {
    let db = openRequest.result
    let transaction = db.transaction(['schedules'], 'readwrite')
    let objectStore = transaction.objectStore('schedules')

    objectStore.get(1).onsuccess = function (event) {
      let data = event.target.result || { id: 1, schedulesArray: [] }
      let schedulesArray = data.schedulesArray || []

      if (!schedulesArray.includes(url)) {
        if (schedulesArray.length >= 5) {
          const deletedUrl = schedulesArray.shift()

          caches.open(deletedUrl).then((cache) => {
            cache.keys().then((keys) => {
              keys.forEach((request) => {
                cache.delete(request)
              })
            })
          })
        }
        schedulesArray.push(url)

        objectStore.put({ id: 1, schedulesArray })
      }
    }
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.url.match(/.*\/schedule\/schedules\/.*/)) {
    event.respondWith(
      caches.open(event.request.url).then((cache) => {
        return fetch(event.request)
          .then((fetchedResponse) => {
            cache.put(event.request, fetchedResponse.clone())
            updateSchedulesDB(event.request.url)
            return fetchedResponse
          })
          .catch(() => {
            return cache.match(event.request)
          })
      })
    )
  }
})

const cacheName = 'tasks-cache'
self.addEventListener('fetch', (event) => {
  if (event.request.url.match(/.*\/task\/user\/.*\/tasks/)) {
    // Open the cache
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return fetch(event.request.url)
          .then((fetchedResponse) => {
            cache.put(event.request, fetchedResponse.clone())

            return fetchedResponse
          })
          .catch(() => {
            return cache.match(event.request.url)
          })
      })
    )
  } else {
    return
  }
})

self.addEventListener('sync', (event) => {
  console.log('Sync event fired!')
  if (event.tag === 'outbox-sync') {
    event.waitUntil(
      openOutbox()
        .then((db) => syncOutbox(db))
        .then((results) => handleSyncResults(results))
        .catch((error) => handleSyncError(error))
    )
  } else {
    console.log('Sync event not supported')
  }
})

const syncOutbox = (db) => {
  return new Promise((resolve, reject) => {
    getAllFormsFromOutbox(db)
      .then((forms) =>
        Promise.all(
          forms.map((form) => {
            const { userId, formData } = repackFormData(form)
            return syncTasksWithServer(userId, formData)
              .then((response) => {
                deleteFormFromOutbox(db, form.id)
                return Promise.resolve(response)
              })
              .catch((error) => Promise.reject(error))
          })
        )
      )
      .then((results) => resolve(results))
      .catch((error) => reject(error))
  })
}

const handleSyncResults = (results) => {
  results.forEach((result) => {
    console.log('Successfully posted to server!\n' + 'Results: \n', result)
  })
}
const handleSyncError = (error) => {
  console.log(
    "The server couldn't be reached.\n" +
      'Reason: ' +
      error +
      '\n' +
      "We'll retry in a few minutes."
  )
  return Promise.reject(error)
}

/*TODO fix periodic background sync, to fire every day at 00.00 (cache last schedule + user tasks) */

// const bgSyncPlugin = new BackgroundSyncPlugin('outbox-sync', {
//   maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
// })
//
// registerRoute(
//   '/api/submit',
//   new NetworkOnly({
//     plugins: [bgSyncPlugin],
//   }),
//   'POST'
// )

// export const registerPeriodicBackgroundSync = async (registration) => {
//   const status = await navigator.permissions.query({
//     name: 'periodic-background-sync',
//   })
//   if (status.state === 'granted' && 'periodicSync' in registration) {
//     try {
//       // Register the periodic background sync.
//       await registration.periodicSync.register('content-sync', {
//         // An interval of one day.
//         minInterval: 24 * 60 * 60 * 1000,
//       })
//
//       // List registered periodic background sync tags.
//       const tags = await registration.periodicSync.getTags()
//       if (tags.length) {
//       }
//       tags.forEach((tag) => {})
//
//       // Update the user interface with the last periodic background sync data.
//       const backgroundSyncCache = await caches.open('periodic-background-sync')
//       if (backgroundSyncCache) {
//         const backgroundSyncResponse =
//           backgroundSyncCache.match('/last-updated')
//       }
//
//       // Listen for incoming periodic background sync messages.
//       navigator.serviceWorker.addEventListener('message', async (event) => {
//         if (event.data.tag === 'content-sync') {
//         }
//       })
//     } catch (err) {
//       console.error(err.name, err.message)
//     }
//   } else {
//   }
// }
