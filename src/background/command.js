// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// 'License'); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { codeExport as exporter } from '@seleniumhq/side-utils'
import location from './location'
import selection from './selection'

export const emitters = {
  addSelection: emitSelect,
  answerOnNextPrompt: skip,
  assert: emitAssert,
  assertAlert: emitAssertAlert,
  assertChecked: emitVerifyChecked,
  assertConfirmation: emitAssertAlert,
  assertEditable: emitVerifyEditable,
  assertElementPresent: emitVerifyElementPresent,
  assertElementNotPresent: emitVerifyElementNotPresent,
  assertNotChecked: emitVerifyNotChecked,
  assertNotEditable: emitVerifyNotEditable,
  assertNotSelectedValue: emitVerifyNotSelectedValue,
  assertNotText: emitVerifyNotText,
  assertPrompt: emitAssertAlert,
  assertSelectedLabel: emitVerifySelectedLabel,
  assertSelectedValue: emitVerifyValue,
  assertValue: emitVerifyValue,
  assertText: emitVerifyText,
  assertTitle: emitVerifyTitle,
  check: emitCheck,
  chooseCancelOnNextConfirmation: skip,
  chooseCancelOnNextPrompt: skip,
  chooseOkOnNextConfirmation: skip,
  click: emitClick,
  clickAt: emitClick,
  close: emitClose,
  debugger: skip,
  do: emitControlFlowDo,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  echo: emitEcho,
  editContent: emitEditContent,
  else: emitControlFlowElse,
  elseIf: emitControlFlowElseIf,
  end: emitControlFlowEnd,
  executeScript: emitExecuteScript,
  executeAsyncScript: emitExecuteAsyncScript,
  forEach: emitControlFlowForEach,
  if: emitControlFlowIf,
  mouseDown: emitMouseDown,
  mouseDownAt: emitMouseDown,
  mouseMove: emitMouseMove,
  mouseMoveAt: emitMouseMove,
  mouseOver: emitMouseMove,
  mouseOut: emitMouseOut,
  mouseUp: emitMouseUp,
  mouseUpAt: emitMouseUp,
  open: emitOpen,
  pause: emitPause,
  removeSelection: emitSelect,
  repeatIf: emitControlFlowRepeatIf,
  run: emitRun,
  runScript: emitRunScript,
  select: emitSelect,
  selectFrame: emitSelectFrame,
  selectWindow: emitSelectWindow,
  sendKeys: emitSendKeys,
  setSpeed: emitSetSpeed,
  setWindowSize: emitSetWindowSize,
  store: emitStore,
  storeAttribute: emitStoreAttribute,
  storeJson: emitStoreJson,
  storeText: emitStoreText,
  storeTitle: emitStoreTitle,
  storeValue: emitStoreValue,
  storeWindowHandle: emitStoreWindowHandle,
  storeXpathCount: emitStoreXpathCount,
  submit: emitSubmit,
  times: emitControlFlowTimes,
  type: emitType,
  uncheck: emitUncheck,
  verify: emitAssert,
  verifyChecked: emitVerifyChecked,
  verifyEditable: emitVerifyEditable,
  verifyElementPresent: emitVerifyElementPresent,
  verifyElementNotPresent: emitVerifyElementNotPresent,
  verifyNotChecked: emitVerifyNotChecked,
  verifyNotEditable: emitVerifyNotEditable,
  verifyNotSelectedValue: emitVerifyNotSelectedValue,
  verifyNotText: emitVerifyNotText,
  verifySelectedLabel: emitVerifySelectedLabel,
  verifySelectedValue: emitVerifyValue,
  verifyText: emitVerifyText,
  verifyTitle: emitVerifyTitle,
  verifyValue: emitVerifyValue,
  waitForElementEditable: emitWaitForElementEditable,
  waitForElementPresent: emitWaitForElementPresent,
  waitForElementVisible: emitWaitForElementVisible,
  waitForElementNotEditable: emitWaitForElementNotEditable,
  waitForElementNotPresent: emitWaitForElementNotPresent,
  waitForElementNotVisible: emitWaitForElementNotVisible,
  webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  waitForText: emitWaitForText,
  webdriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
}

exporter.register.preprocessors(emitters)

function register(command, emitter) {
  exporter.register.emitter({ command, emitter, emitters })
}

function emit(command) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}

function canEmit(commandName) {
  return !!emitters[commandName]
}

function variableLookup(varName) {
  return `$this->vars['${varName}']`
}

function variableSetter(varName, value) {
  return varName ? `$this->vars['${varName}'] = ${value};` : ``
}

function emitWaitForWindow() {
  const generateMethodDeclaration = (name) => {
    return {
      body: `public function ${name}(AcceptanceTester $i, $timeout = 2) {`,
      terminatingKeyword: `}\n`,
    }
  }
  const commands = [
    { level: 0, statement: `usleep($timeout);` },
    { level: 0, statement: `$handlesThen = $this->vars['windowHandles'];` },
    { level: 0, statement: `$handlesNow = null;` },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$handlesNow) {`,
    },
    {
      level: 1,
      statement: `$handlesNow = $driver->getWindowHandles();`,
    },
    { level: 0, statement: `});` },
    { level: 0, statement: `if (count($handlesNow) > count($handlesThen)) {` },
    {
      level: 1,
      statement: `return array_diff($handlesNow, $handlesThen)[0]`,
    },
    { level: 0, statement: `}` },
    {
      level: 0,
      statement: `throw new RuntimeException('New window did not appear before timeout');`,
    },
  ]
  return Promise.resolve({
    name: `waitForWindow`,
    commands,
    generateMethodDeclaration,
  })
}

async function emitNewWindowHandling(command, emittedCommand) {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `$this->vars['windowHandles'] = 'windowHandles';`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: emittedCommand },
    {
      level: 0,
      statement: `$this->vars['${command.windowHandleName}'] = '${command.windowHandleName}';`,
    },
  ]
  return Promise.resolve({ commands })
}

function emitAssert(varName, value) {
  return Promise.resolve(
    `$i->assertEquals($this->vars['${varName}'], '${value}');`
  )
}

function emitAssertAlert(alertText) {
  return Promise.resolve(`$i->seeInPopup('${alertText}');`)
}

function emitAnswerOnNextPrompt(textToSend) {
  const commands = [
    { level: 0, statement: `$i->typeInPopup('${textToSend}');` },
    { level: 0, statement: `$i->acceptPopup();` },
  ]
  return Promise.resolve({ commands })
}

async function emitCheck(locator) {
  return Promise.resolve(`$i->checkOption(${await location.emit(locator)});`)
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`$i->cancelPopup();`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`$i->acceptPopup();`)
}

async function emitClick(target) {
  return Promise.resolve(`$i->click(${await location.emit(target)});`)
}

async function emitClose() {
  return Promise.resolve(`$i->closeTab();`)
}

function generateExpressionScript(script) {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `return $driver->executeScript('return (${
        script.script
      })'${generateScriptArguments(script)});`,
    },
    {
      level: 0,
      statement: `});`,
    },
  ]
  return Promise.resolve({ commands })
}

function generateScriptArguments(script) {
  return `${script.argv.length ? `, [` : ``}${script.argv
    .map((varName) => `$this->vars['${varName}']`)
    .join(`,`)}${script.argv.length ? `]` : ``}`
}

function emitControlFlowDo() {
  return Promise.resolve({
    commands: [{ level: 0, statement: `do {` }],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowElse() {
  return Promise.resolve({
    commands: [{ level: 0, statement: `} else {` }],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowElseIf(script) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `} elseif (!!${generateExpressionScript(script)}) {`,
      },
    ],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowEnd() {
  return Promise.resolve({
    commands: [{ level: 0, statement: `}` }],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowIf(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `if (!!${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(collectionVarName, iteratorVarName) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `$collection = $this->vars['${collectionVarName}'];`,
      },
      {
        level: 0,
        statement: `for ($c = 0; $c < count($collection) - 1; $c++) {`,
      },
      {
        level: 1,
        statement: `$this->vars['${iteratorVarName}'] = $this->vars['${collectionVarName}'][$c];`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `} while (!!${generateExpressionScript(script)});`,
      },
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target) {
  const commands = [
    {
      level: 0,
      statement: `$times = ${target};`,
    },
    {
      level: 0,
      statement: `for ($c = 0; $c < $times; $c++) {`,
    },
  ]
  return Promise.resolve({ commands, endingLevelAdjustment: 1 })
}

function emitControlFlowWhile(script) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `while (!!${generateExpressionScript(script)}) {`,
      },
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target) {
  return Promise.resolve(`$i->doubleClick(${await location.emit(target)});`)
}

async function emitDragAndDrop(dragged, dropped) {
  return Promise.resolve(
    `$i->dragAndDrop(${await location.emit(dragged)}, ${await location.emit(
      dropped
    )});`
  )
}

async function emitEcho(message) {
  const _message = message.startsWith(`$this->vars[`) ? message : `'${message}'`
  return Promise.resolve(`codecept_debug(${_message})`)
}

async function emitEditContent(locator, content) {
  const commands = [
    {
      level: 0,
      statement: `$element = null;`,
    },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$element) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 0,
      statement: `});`,
    },
    {
      level: 0,
      statement: `$i->executeJS('if(arguments[0].contentEditable === true) {arguments[0].innerText = "${content}"}', [$element]);`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitExecuteScript(script, varName) {
  const scriptString = script.script.replace(/'/g, `\\'`)
  const result = `$i->executeJS('${scriptString}'${generateScriptArguments(
    script
  )});`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitExecuteAsyncScript(script, varName) {
  const result = `$i->executeAsyncJS('var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}');`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitMouseDown(locator) {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )})`,
    },
    {
      level: 1,
      statement: `$driver->action()->moveToElement($element)->clickAndHold()->perform();`,
    },
    {
      level: 0,
      statement: `});`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseMove(locator) {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `$driver->action()->moveToElement($element)->perform();`,
    },
    {
      level: 0,
      statement: `});`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(WebDriverBy::cssSelector('body'));`,
    },
    {
      level: 1,
      statement: `$driver->action()->moveToElement($element)->perform();`,
    },
    {
      level: 0,
      statement: `});`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator) {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `$driver->action()->moveToElement($element)->release()->perform();`,
    },
    {
      level: 0,
      statement: `});`,
    },
  ]
  return Promise.resolve({ commands })
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `'${target}'`
    : `'${global.baseUrl}${target}'`
  return Promise.resolve(`$i->amOnUrl(${url});`)
}

async function emitPause(time) {
  const commands = [{ level: 0, statement: `$i->wait(${time});` }]
  return Promise.resolve({ commands })
}

async function emitRun(testName) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}();`)
}

async function emitRunScript(script) {
  return Promise.resolve(
    `$i->executeJS('${script.script}${generateScriptArguments(script)}');`
  )
}

async function emitSetWindowSize(size) {
  const [width, height] = size.split(`x`)
  return Promise.resolve(`$i->resizeWindow(${width}, ${height});`)
}

async function emitSelect(selectElement, option) {
  return Promise.resolve(
    `$i->selectOption(${await location.emit(
      selectElement
    )}, ${await selection.emit(option)});`
  )
}

async function emitSelectFrame(frameLocation) {
  if (frameLocation === `relative=top` || frameLocation === `relative=parent`) {
    return Promise.resolve(`$i->switchToFrame();`)
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve({
      commands: [
        {
          level: 0,
          statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
        },
        {
          level: 1,
          statement: `$driver->switchTo()->frame(${Math.floor(
            frameLocation.split(`index=`)[1]
          )});`,
        },
        {
          level: 0,
          statement: `});`,
        },
      ],
    })
  } else {
    return Promise.resolve(
      `$i->switchToFrame(${await location.emit(frameLocation)});`
    )
  }
}

async function emitSelectWindow(windowLocation) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `$i->switchToWindow(${windowLocation.split(`handle=`)[1]});`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `$i->switchToWindow('${windowLocation.split(`name=`)[1]}');`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === `win_ser_local`) {
      return Promise.resolve({
        commands: [
          {
            level: 0,
            statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
          },
          {
            level: 1,
            statement: `$driver->switchTo()->window($driver->getWindowHandles()[0])`,
          },
          {
            level: 0,
            statement: `});`,
          },
        ],
      })
    } else {
      const index = parseInt(windowLocation.substr(`win_ser_`.length))
      return Promise.resolve({
        commands: [
          {
            level: 0,
            statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
          },
          {
            level: 1,
            statement: `$driver->switchTo()->window($driver->getWindowHandles()[${index}]);`,
          },
          {
            level: 0,
            statement: `});`,
          },
        ],
      })
    }
  } else {
    return Promise.reject(
      new Error(`Can only emit 'select window' using handles`)
    )
  }
}

function generateSendKeysInput(value) {
  if (typeof value === `object`) {
    return value
      .map((s) => {
        if (s.startsWith(`$this->vars[`)) {
          return s
        } else if (s.startsWith(`Key[`)) {
          const key = s.match(/\['(.*)'\]/)[1]
          return `WebDriverKeys::${key}`
        } else {
          return `'${s}'`
        }
      })
      .join(`, `)
  } else {
    if (value.startsWith(`$this->vars[`)) {
      return value
    } else {
      return `'${value}'`
    }
  }
}

async function emitSendKeys(target, value) {
  return Promise.resolve(
    `$i->pressKey(${await location.emit(target)}, ${generateSendKeysInput(
      value
    )});`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    `codecept_debug('"set speed" is a no-op in code export, use "pause" instead');`
  )
}

async function emitStore(value, varName) {
  return Promise.resolve(variableSetter(varName, `'${value}'`))
}

async function emitStoreAttribute(locator, varName) {
  const attributePos = locator.lastIndexOf(`@`)
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)
  const commands = [
    {
      level: 0,
      statement: `$attribute = null;`,
    },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$attribute) {`,
    },
    {
      level: 1,
      statement: `$attribute = $driver->findElement(${await location.emit(
        elementLocator
      )})->getAttribute('${attributeName}');`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: `${variableSetter(varName, `$attribute`)}` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreJson(json, varName) {
  return Promise.resolve(variableSetter(varName, `JSON.parse("${json}")`))
}

async function emitStoreText(locator, varName) {
  const commands = [
    {
      level: 0,
      statement: `$text = null;`,
    },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$text) {`,
    },
    {
      level: 1,
      statement: `$text = $driver->findElement(${await location.emit(
        locator
      )})->getText();`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: `${variableSetter(varName, `$text`)}` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreTitle(_, varName) {
  const commands = [
    {
      level: 0,
      statement: `$title = null;`,
    },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$title) {`,
    },
    {
      level: 1,
      statement: `$title = $driver->getTitle();`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: `${variableSetter(varName, `$title`)}` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreValue(locator, varName) {
  const commands = [
    {
      level: 0,
      statement: `$value = null;`,
    },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$value) {`,
    },
    {
      level: 1,
      statement: `$attribute = $driver->findElement(${await location.emit(
        locator
      )})->getAttribute('value');`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: `${variableSetter(varName, `$value`)}` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreWindowHandle(varName) {
  const commands = [
    {
      level: 0,
      statement: `$handle = null;`,
    },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$handle) {`,
    },
    {
      level: 1,
      statement: `$handle = $driver->getWindowHandle();`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: `${variableSetter(varName, `$handle`)}` },
  ]
  return Promise.resolve({ commands })
}

async function emitStoreXpathCount(locator, varName) {
  const commands = [
    {
      level: 0,
      statement: `$count = null;`,
    },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$count) {`,
    },
    {
      level: 1,
      statement: `$count = count($driver->findElements(${await location.emit(
        locator
      )});`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: `${variableSetter(varName, `$count`)}` },
  ]
  return Promise.resolve({ commands })
}

async function emitSubmit(_locator) {
  return Promise.resolve(
    `throw new InvalidArgumentException('\`submit\` is not a supported command in Selenium Webdriver. Please re-record the step in the IDE.');`
  )
}

async function emitType(target, value) {
  return emitSendKeys(target, value)
}

async function emitUncheck(locator) {
  const commands = [
    {
      level: 0,
      statement: `{`,
    },
    {
      level: 1,
      statement: `$i->uncheckOption(${await location.emit(locator)});`,
    },
    {
      level: 0,
      statement: `}`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyChecked(locator) {
  return Promise.resolve(
    `$i->seeCheckboxIsChecked(${await location.emit(locator)});`
  )
}

async function emitVerifyEditable(locator) {
  const commands = [
    { level: 0, statement: `$element = null;` },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$element) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: `$i->assertTrue($element->isEnabled());` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementPresent(locator) {
  return Promise.resolve(
    `$i->seeElementInDOM(${await location.emit(locator)});`
  )
}

async function emitVerifyElementNotPresent(locator) {
  return Promise.resolve(
    `$i->dontSeeElementInDOM(${await location.emit(locator)});`
  )
}

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(
    `$i->dontSeeCheckboxIsChecked(${await location.emit(locator)});`
  )
}

async function emitVerifyNotEditable(locator) {
  const commands = [
    { level: 0, statement: `$element = null;` },
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) use (&$element) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 0,
      statement: `});`,
    },
    { level: 0, statement: `$i->assertFalse($element->isEnabled());` },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  return Promise.resolve(
    `$i->seeOptionIsNotSelected(${await location.emit(
      locator
    )}, ${exporter.emit.text(expectedValue)});`
  )
}

async function emitVerifyNotText(locator, text) {
  return Promise.resolve(
    `$i->dontSee(${exporter.emit.text(text)}, ${await location.emit(locator)});`
  )
}

async function emitVerifySelectedLabel(locator, labelValue) {
  return Promise.resolve(
    `$i->seeOptionIsSelected(${await location.emit(locator)}, '${labelValue}');`
  )
}

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `$i->see(${exporter.emit.text(text)}, ${await location.emit(locator)});`
  )
}

async function emitVerifyValue(locator, value) {
  return Promise.resolve(
    `$i->seeElement(${await location.emit(locator)}, ['value' => '${value}']);`
  )
}

async function emitVerifyTitle(title) {
  return Promise.resolve(`$i->seeInTitle('${title}');`)
}

function skip() {
  return Promise.resolve(``)
}

async function emitWaitForElementPresent(locator, timeout) {
  return Promise.resolve(
    `$i->waitForElement(${await location.emit(locator)}), ${Math.floor(
      timeout
    )})`
  )
}

async function emitWaitForElementNotPresent(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `$driver->wait(${Math.floor(
        timeout
      )})->until(WebDriverExpectedCondition::stalenessOf($element));`,
    },
    {
      level: 0,
      statement: `});`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementVisible(locator, timeout) {
  return Promise.resolve(
    `$i->waitForElementVisible(${await location.emit(locator)});, ${Math.floor(
      timeout
    )});`
  )
}

async function emitWaitForElementNotVisible(locator, timeout) {
  return Promise.resolve(
    `$i->waitForElementNotVisible(${await location.emit(
      locator
    )});, ${Math.floor(timeout)});`
  )
}

// $driver->wait()->until(
//   function () use ($driver) {
//   $elements = $driver->findElements(WebDriverBy::cssSelector(`li.foo`));
//
//   return count($elements) > 5;
// },
// `Error locating more than five elements`
// );

async function emitWaitForElementEditable(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `$driver->wait(${Math.floor(
        timeout
      )})->until(function () use ($element) { return $element->isEnabled(); });`,
    },
    {
      level: 0,
      statement: `});`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementNotEditable(locator, timeout) {
  const commands = [
    {
      level: 0,
      statement: `$i->executeInSelenium(function (RemoteWebDriver $driver) {`,
    },
    {
      level: 1,
      statement: `$element = $driver->findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `$driver->wait(${Math.floor(
        timeout
      )})->until(function () use ($element) { return !$element->isEnabled(); });`,
    },
    {
      level: 0,
      statement: `});`,
    },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForText(locator, text) {
  const timeout = 30000
  return Promise.resolve(
    `$i->waitForText(${await location.emit(locator)}, ${Math.floor(
      timeout
    )}, '${text}');`
  )
}

export default {
  canEmit,
  emit,
  register,
  extras: { emitWaitForWindow },
}
