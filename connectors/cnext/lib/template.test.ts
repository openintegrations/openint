import {describe, expect, it} from '@jest/globals'
import Mustache from 'mustache'
import {proxyRequiredRecursive} from '@openint/util/proxy-utils'
import {renderTemplateObject} from './template'

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

  it('should throw for unmatched template variables', () => {
    const template = 'Hello {{name}} {{baseURLs.connect}}'
    const data = proxyRequiredRecursive(
      {name: 'World'},
      {
        formatError: ({key, reason}) =>
          new Error(`Missing variable for ${key} (${reason})`),
      },
    )
    expect(() => Mustache.render(template, data)).toThrow(
      'Missing variable for baseURLs (missing)',
    )
  })
})

describe('renderTemplateObject', () => {
  it('should process object templates with connector config', () => {
    const template = {
      name: '{{connectorConfig.name}}',
      api: {
        url: '{{connectorConfig.api.baseURL}}',
        key: '{{connectionSettings.apiKey}}',
      },
    }

    const connectorConfig = {
      name: 'TestConnector',
      api: {
        baseURL: 'https://api.example.com',
      },
    }

    const connectionSettings = {
      apiKey: 'secret-key-123',
    }

    const context = {
      connectorConfig,
      connectionSettings,
    }

    const result = renderTemplateObject(template, context)

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
        {path: '{{connectorConfig.api.baseURL}}/users'},
        {path: '{{connectorConfig.api.baseURL}}/products'},
      ],
    }

    const connectorConfig = {
      api: {
        baseURL: 'https://api.example.com',
      },
    }

    const connectionSettings = {}

    const context = {
      connectorConfig,
      connectionSettings,
    }

    const result = renderTemplateObject(template, context)

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

    const context = {
      connectorConfig,
      connectionSettings,
    }

    // Should return the original object if JSON parsing fails
    expect(() => renderTemplateObject(template, context)).toThrow(
      'Error processing object template',
    )
  })

  it('should handle non-object inputs', () => {
    const template = null
    const connectorConfig = {}
    const connectionSettings = {}

    const context = {
      connectorConfig,
      connectionSettings,
    }

    expect(() =>
      renderTemplateObject(
        template as unknown as Record<string, unknown>,
        context,
      ),
    ).toThrow('Template must be a plain object')
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

    const context = {
      connectorConfig,
      connectionSettings,
    }

    const result = renderTemplateObject(template, context)

    expect(result).toEqual({
      prefix_test: 'value',
      nested: {
        dynamicKey: 'nested value',
      },
    })
  })

  it('should throw for missing template variables', () => {
    const template = {
      name: '{{name}}',
    }

    const context = {}

    expect(() => renderTemplateObject(template, context)).toThrow(
      'Template variable "name" is required but missing',
    )
  })
})
