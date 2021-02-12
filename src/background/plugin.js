// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { codeExport as exporter } from '@seleniumhq/side-utils'
import emitter from './command'
import { generateHooks } from './hook'

// Define language options
export const displayName = 'PHP Codeception'

export let opts = {}
opts.emitter = emitter
opts.hooks = generateHooks()
opts.fileExtension = '.php'
opts.commandPrefixPadding = '    '
opts.terminatingKeyword = '}'
opts.commentPrefix = '//'
opts.generateMethodDeclaration = generateMethodDeclaration

// Create generators for dynamic string creation of primary entities (e.g., filename, methods, test, and suite)
function generateTestDeclaration(name) {
  return `\npublic function test${exporter.parsers.capitalize(
    exporter.parsers.sanitizeName(name)
  )}(AcceptanceTester $i) {`
}
function generateMethodDeclaration(name) {
  return `\npublic function ${exporter.parsers.uncapitalize(
    exporter.parsers.sanitizeName(name)
  )}() {`
}
function generateSuiteDeclaration(name) {
  return `\nclass ${exporter.parsers.capitalize(
    exporter.parsers.sanitizeName(name)
  )}Cest {`
}
function generateFilename(name) {
  return `${exporter.parsers.capitalize(
    exporter.parsers.sanitizeName(name)
  )}Cest${opts.fileExtension}`
}

// Emit an individual test, wrapped in a suite (using the test name as the suite name)
export async function emitTest({
  url,
  test,
  tests,
  project,
  enableOriginTracing,
  beforeEachOptions,
  enableDescriptionAsComment,
}) {
  global.baseUrl = url
  const testDeclaration = generateTestDeclaration(test.name)
  const result = await exporter.emit.test(test, tests, {
    ...opts,
    testDeclaration,
    enableOriginTracing,
    enableDescriptionAsComment,
    project,
  })
  const suiteName = test.name
  const suiteDeclaration = generateSuiteDeclaration(suiteName)
  const _suite = await exporter.emit.suite(result, tests, {
    ...opts,
    suiteDeclaration,
    suiteName,
    project,
    beforeEachOptions,
  })
  return {
    filename: generateFilename(test.name),
    body: exporter.emit.orderedSuite(_suite),
  }
}

// Emit a suite with all of its tests
export async function emitSuite({
  url,
  suite,
  tests,
  project,
  enableOriginTracing,
  beforeEachOptions,
  enableDescriptionAsComment,
}) {
  global.baseUrl = url
  const result = await exporter.emit.testsFromSuite(tests, suite, opts, {
    enableOriginTracing,
    generateTestDeclaration,
    enableDescriptionAsComment,
    project,
  })
  const suiteDeclaration = generateSuiteDeclaration(suite.name)
  const _suite = await exporter.emit.suite(result, tests, {
    ...opts,
    suiteDeclaration,
    suite,
    project,
    beforeEachOptions,
  })
  return {
    filename: generateFilename(suite.name),
    body: exporter.emit.orderedSuite(_suite),
  }
}

export default {
  emit: {
    test: emitTest,
    suite: emitSuite,
    locator: location.emit,
  },
  register: {
    command: emitter.register,
    variable: opts.hooks.declareVariables.register,
    dependency: opts.hooks.declareDependencies.register,
    beforeAll: opts.hooks.beforeAll.register,
    beforeEach: opts.hooks.beforeEach.register,
    afterEach: opts.hooks.afterEach.register,
    afterAll: opts.hooks.afterAll.register,
    inEachBegin: opts.hooks.inEachBegin.register,
    inEachEnd: opts.hooks.inEachEnd.register,
  },
}
