import localforage from 'localforage'

const store = localforage.createInstance({ name: 'linux-web-portfolio' })

export async function setItem(key, value){
  return store.setItem(key, value)
}

export async function getItem(key){
  return store.getItem(key)
}

export async function removeItem(key){
  return store.removeItem(key)
}

export default { setItem, getItem, removeItem }
