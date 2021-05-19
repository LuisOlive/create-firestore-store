import firebase from 'firebase/app'
import 'firebase/firestore'
import config from '../../firebase.config'
import { writable } from 'svelte/store'

/**
 * @typedef {firebase.firestore.CollectionReference<firebase.firestore.DocumentData>} Collection
 */

firebase.initializeApp(config)
const db = firebase.firestore()

/**
 * It reads and writes data into the firestore collections and returns
 * the decoded firebase snapshot into a Svelte store
 *
 * @param {string} collectionName the name of the firestore collection, for example: users
 * @param {CollectionModifier} [beforeRequest] a function to apply filters, sorts or limits to collection
 */
export default function createFirestoreStore(collectionName, beforeRequest = x => x) {
  const { subscribe, update, set } = writable([])

  const collection = db.collection(collectionName)

  /**
   * @async
   * It sends a document to firestore
   *
   * @param {object} data
   * @param {string} [docName] name of document in the collection
   */
  const send = (data, docName) => collection.doc(docName).set(data)

  beforeRequest(collection).onSnapshot(snapshot => {
    set([])

    snapshot.forEach(doc => update(arr => [...arr, { id: doc.id, ...doc.data() }]))
  })

  return { send, collection, subscribe, set }
}

/**
 * The process to apply to firestor collection as orderBy, limit, where, etc.
 *
 * @callback CollectionModifier
 * @param {Collection} the original collection to modify
 * @returns {Collection} the modified collection
 */
