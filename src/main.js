'use babel'

import isArray from 'lodash/isArray'
import remove from 'lodash/remove'
import { CompositeDisposable, Disposable } from 'atom'

import RootProvider from './root-provider'
import { JsonSchemaProposalProvider } from './json-schema-proposal-provider'
import { defaultProviders, defaultSchemaProviders } from './providers'

let PROVIDERS = null

export function activate() {
  PROVIDERS = []
}

export function provideAutocomplete() {
  return new RootProvider(PROVIDERS)
}

export function provideJsonSchemaProviders() {
  return defaultSchemaProviders
}

export function provideProposalProviders() {
  return defaultProviders
}

function createPromiseDisposable(promise) {
  return new Disposable(() => {
    promise.then(provider => remove(PROVIDERS, e => e === provider))
  })
}

function createSyncDisposable(provider) {
  return new Disposable(() => {
    remove(PROVIDERS, e => e === provider)
  })
}

function createCompositeDisposable(providers) {
  const composite = new CompositeDisposable()
  providers.forEach(disposable => composite.add(disposable))
  return composite
}

export function consumeJsonSchemaProviders(provider) {
  const schemaProviders = isArray(provider) ? provider : [provider]
  const providerPromises = schemaProviders.filter(s => Boolean(s))
    .map(s => JsonSchemaProposalProvider.createFromProvider(s))
  providerPromises.forEach(promise => promise.then(p => PROVIDERS.push(p)))
  const disposables = providerPromises.map(promise => createPromiseDisposable(promise))
  return createCompositeDisposable(disposables)
}

export function consumeJsonProposalProviders(provider) {
  const providers = (isArray(provider) ? provider : [provider]).filter(p => Boolean(p))
  providers.forEach(p => PROVIDERS.push(p))
  return createCompositeDisposable(providers.map(p => createSyncDisposable(p)))
}

export function dispose() {
  PROVIDERS.length = 0
  PROVIDERS = null
}
