const IDB_VERS = 1
const DB_NAME_1 = 'outbox'
const OBJ_STORE_NAME = 'planner' + IDB_VERS
const POST_TASK_URL = process.env.REACT_APP_API as string

const outboxIsSupported =
  'serviceWorker' in navigator && 'SyncManager' in window

const syncTasksWithServer = (userId: string, formData: FormData) => {
  return new Promise(function (resolve, reject) {
    fetch(new URL(`/user/${userId}/tasks`, POST_TASK_URL), {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText)
        }
        return response.json()
      })
      .catch((error) => reject(error))
      .then((response) => resolve(response))
  })
}

const openOutbox = () => {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(DB_NAME_1, IDB_VERS)
    request.onerror = function (event: any) {
      reject(event.target.errorcode)
    }
    request.onsuccess = function (event) {
      console.log('Outbox opened...')
      resolve(this.result)
    }
    request.onupgradeneeded = function (event: any) {
      const store = event.target!.result.createObjectStore(OBJ_STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      })
      const msg =
        event.oldVersion === 0
          ? 'Outbox installed!'
          : `Outbox upgraded from v.${event.oldVersion} to v.${event.newVersion}!`
      console.log(msg)
    }
  })
}

const addTaskToOutbox = (db: any, formData: FormData, userId: string) => {
  return new Promise(function (resolve, reject) {
    const formArray = unpackFormData(userId, formData)
    const store = db
      .transaction(OBJ_STORE_NAME, 'readwrite')
      .objectStore(OBJ_STORE_NAME)
    const request = store.add(formArray)
    request.onerror = function (event: any) {
      reject(new Error(event.target.errorcode))
    }
    request.onsuccess = function (event: any) {
      console.log('Form data saved to outbox successfully.')
      resolve(event.target.result)
    }
  })
}

const getAllFormsFromOutbox = (outbox: any) => {
  return new Promise(function (resolve, reject) {
    const store = outbox
      .transaction(OBJ_STORE_NAME, 'readonly')
      .objectStore(OBJ_STORE_NAME)
    const request = store.getAll()
    request.onerror = function (event: any) {
      reject(
        new Error('Could not access IDB. Error Code: ' + event.target.errorcode)
      )
    }
    request.onsuccess = function (event: any) {
      console.log('Form data retrieved from outbox.')
      resolve(event.target.result)
    }
  })
}

const deleteFormFromOutbox = (db: any, id: any) => {
  return new Promise((resolve, reject) => {
    const store = db
      .transaction(OBJ_STORE_NAME, 'readwrite')
      .objectStore(OBJ_STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = (event: any) => {
      resolve(`Form id#${id} deleted from outbox.`)
    }
    request.onerror = (event: any) => {
      reject(
        `Failed to clear form id#${id} from db. Error code: ${event.error}`
      )
    }
  })
}

const unpackFormData = (userId: string, formData: FormData) => {
  let arr = []
  arr.push({ userId })
  for (let [key, value] of formData.entries()) {
    arr.push({ key, value })
  }
  return arr
}

const repackFormData = (keyValues: any) => {
  const formData = new FormData()
  let userId
  for (let pair of keyValues) {
    if (pair.key === 'userId') {
      userId = pair.value
      continue
    }
    formData.append(pair.key, pair.value)
  }
  return { userId: userId, formData }
}
