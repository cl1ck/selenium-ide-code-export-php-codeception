# selenium-ide-code-export-php-codeception

PHP Codeception code export for Selenium IDE.

To use the exported code you must set up acceptance testing in Codeception with proper namespacing:

```yaml
# composer.json
{
  "autoload": {
    "psr-4": {
      "App\\Tests\\": "tests/"
    }
  },
  "require-dev": {
    "codeception/codeception": "^4.1",
    "codeception/module-asserts": "^1.3",
    "codeception/module-webdriver": "^1.0"
  }
}

# codeception.yml
namespace: App\Tests

paths:
  tests: tests
  support: tests
  output: tests/_output
  data: tests/_data
  envs: tests/_envs

# tests/acceptance.suite.yml
actor: AcceptanceTester

modules:
  enabled:
        - WebDriver:
            url: 
            browser: chrome
        - \Helper\Acceptance
    - Asserts
    - App\Tests\Helper\Acceptance
```

## Build

```shell
yarn build
```

## Test

```shell
yarn test
```
