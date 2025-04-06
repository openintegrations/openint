import {describe, expect, it} from '@jest/globals'
import Mustache from 'mustache'
import {fillOutStringTemplateVariables} from './template'

describe('template', () => {
  it('should render a basic template', () => {
    const template = 'Hello {{name}}!'
    const data = {name: 'World'}
    const result = Mustache.render(template, data)
    expect(result).toBe('Hello World!')
  })

  it('should handle nested objects', () => {
    const template = '{{user.name}} is {{user.age}} years old'
    const data = {
      user: {
        name: 'John',
        age: 30,
      },
    }
    const result = Mustache.render(template, data)
    expect(result).toBe('John is 30 years old')
  })

  it('should handle arrays with iteration', () => {
    const template = '{{#items}}{{name}}, {{/items}}'
    const data = {
      items: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}],
    }
    const result = Mustache.render(template, data)
    expect(result).toBe('foo, bar, baz, ')
  })

  it('should handle conditional sections', () => {
    const template =
      '{{#showGreeting}}Hello{{/showGreeting}}{{^showGreeting}}Goodbye{{/showGreeting}}'
    const dataTrue = {showGreeting: true}
    const dataFalse = {showGreeting: false}

    expect(Mustache.render(template, dataTrue)).toBe('Hello')
    expect(Mustache.render(template, dataFalse)).toBe('Goodbye')
  })
})

describe('fillOutStringTemplateVariables', () => {
  it('should process object templates with connector config', () => {
    const template = {
      name: '{{connectorConfig.name}}',
      api: {
        url: '{{connectorConfig.api.baseUrl}}',
        key: '{{connectionSettings.apiKey}}',
      },
    }

    const connectorConfig = {
      name: 'TestConnector',
      api: {
        baseUrl: 'https://api.example.com',
      },
    }

    const connectionSettings = {
      apiKey: 'secret-key-123',
    }

    const result = fillOutStringTemplateVariables(
      template,
      connectorConfig,
      connectionSettings,
    )

    expect(result).toEqual({
      name: 'TestConnector',
      api: {
        url: 'https://api.example.com',
        key: 'secret-key-123',
      },
    })
  })

  it('should handle nested arrays in object templates', () => {
    const template = {
      endpoints: [
        {path: '{{connectorConfig.api.baseUrl}}/users'},
        {path: '{{connectorConfig.api.baseUrl}}/products'},
      ],
    }

    const connectorConfig = {
      api: {
        baseUrl: 'https://api.example.com',
      },
    }

    const connectionSettings = {}

    const result = fillOutStringTemplateVariables(
      template,
      connectorConfig,
      connectionSettings,
    )

    expect(result).toEqual({
      endpoints: [
        {path: 'https://api.example.com/users'},
        {path: 'https://api.example.com/products'},
      ],
    })
  })

  it('should handle invalid JSON gracefully', () => {
    // This is a contrived example that would cause JSON parsing issues
    // after template rendering
    const template = {
      invalid: '{{connectorConfig.invalid}}',
    }

    const connectorConfig = {
      invalid: '{"unclosed": "object"',
    }

    const connectionSettings = {}

    // Should return the original object if JSON parsing fails
    expect(() =>
      fillOutStringTemplateVariables(
        template,
        connectorConfig,
        connectionSettings,
      ),
    ).toThrow('Error processing object template')
  })

  it('should handle non-object inputs', () => {
    const template = null as unknown as object
    const connectorConfig = {}
    const connectionSettings = {}

    const result = fillOutStringTemplateVariables(
      template,
      connectorConfig,
      connectionSettings,
    )
    expect(result).toBeNull()
  })

  it('should allow templating in object keys', () => {
    const template = {
      '{{connectorConfig.keyPrefix}}_test': 'value',
      nested: {
        '{{connectorConfig.nestedKey}}': 'nested value',
      },
    }

    const connectorConfig = {
      keyPrefix: 'prefix',
      nestedKey: 'dynamicKey',
    }

    const connectionSettings = {}

    const result = fillOutStringTemplateVariables(
      template,
      connectorConfig,
      connectionSettings,
    )

    expect(result).toEqual({
      prefix_test: 'value',
      nested: {
        dynamicKey: 'nested value',
      },
    })
  })
})
