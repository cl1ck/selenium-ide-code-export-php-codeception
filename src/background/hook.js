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

const emitters = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  declareDependencies,
  declareMethods: empty,
  declareVariables,
  inEachBegin: empty,
  inEachEnd: empty,
}

function generate(hookName) {
  return new exporter.hook(emitters[hookName]())
}

export function generateHooks() {
  let result = {}
  Object.keys(emitters).forEach((hookName) => {
    result[hookName] = generate(hookName)
  })
  return result
}

function afterAll() {
  return {
    startingSyntax: {
      commands: [{ level: 0, statement: 'public function _afterSuite() {' }],
    },
    endingSyntax: {
      commands: [
        { level: 0, statement: '}' },
      ],
    },
    registrationLevel: 1,
  }
}

function afterEach() {
  return {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'public function _after() {' },
        // { level: 1, statement: 'driver.quit();' },
      ],
    },
    endingSyntax: {
      commands: [
        { level: 0, statement: '}' },
      ],
    },
  }
}

function beforeAll() {
  return {
    startingSyntax: {
      commands: [{ level: 0, statement: 'public function _initialize() {' }],
    },
    endingSyntax: {
      commands: [
        { level: 0, statement: '}' },
      ],
    },
    registrationLevel: 1,
  }
}

function beforeEach() {
  return {
    startingSyntax: ({ browserName, gridUrl } = {}) => ({
      commands: [
        {
          level: 0,
          statement: `public function _before() {`,
        },
      ],
    }),
    endingSyntax: {
      commands: [
        { level: 0, statement: '}' },
      ],
    },
  }
}

function declareDependencies() {
  return {
    startingSyntax: {
      commands: [
        { level: 0, statement: '<?php' },
        { level: 0, statement: '' },
        { level: 0, statement: '/** phpcs:ignoreFile */' },
        { level: 0, statement: '' },
        { level: 0, statement: 'declare(strict_types=1);' },
        { level: 0, statement: '' },
        { level: 0, statement: 'namespace App\\Tests\\acceptance;' },
        { level: 0, statement: '' },
        { level: 0, statement: 'use App\\Tests\\AcceptanceTester;' },
        { level: 0, statement: 'use Codeception\\Util\\Fixtures;' },
        {
          level: 0,
          statement: 'use Facebook\\WebDriver\\Remote\\RemoteWebDriver;',
        },
        { level: 0, statement: 'use Facebook\\WebDriver\\WebDriverKeys;' },
        {
          level: 0,
          statement: 'use Facebook\\WebDriver\\WebDriverExpectedCondition;',
        },
        { level: 0, statement: 'use Facebook\\WebDriver\\WebDriverBy;' },
      ],
    },
  }
}

function declareVariables() {
  return {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'private array $vars = [];' },
        { level: 0, statement: '' },
      ],
    },
  }
}

function empty() {
  return {}
}
