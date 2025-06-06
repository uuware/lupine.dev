// It is similar to a thread-local storage in other languages.
import { AsyncLocalStorage } from 'node:async_hooks';
import { AsyncStorageProps } from '../models/async-storage-props';

export const asyncLocalStorage = new AsyncLocalStorage<AsyncStorageProps>();
