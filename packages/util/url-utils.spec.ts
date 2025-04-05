import {joinPath, parseQueryParams, stringifyQueryParams} from './url-utils'

// import path from 'node:path'

test.each([
  ['http://example.com/', '/hello', 'http://example.com/hello'],
  ['http://example.com', '/hello', 'http://example.com/hello'],
  ['http://example.com', 'hello', 'http://example.com/hello'],
  ['http://example.com', 'hello/', 'http://example.com/hello/'],
  ['graphql/v1', '', 'graphql/v1'],
  ['rest/v1/', '', 'rest/v1/'],
  ['rest/v1/', '/', 'rest/v1/'],
  ['rest/v1/', '//', 'rest/v1/'],
  ['rest/v1/', '///', 'rest/v1/'],
  ['/rest/v1/', '', '/rest/v1/'],
  ['/', '/api/v1', '/api/v1'],
])('joinPath(%o, %o) -> %o', (p1, p2, output) => {
  // os.path.join does not handle :// , so this is actually not the same
  // expect(path.join(p1, p2)).toEqual(output)
  expect(joinPath(p1, p2)).toEqual(output)
})

test.each([
  [{metadata: {id: '123'}}, 'metadata[id]=123'],
  [{hello: 'world', again: '123'}, 'hello=world&again=123'],
  [{arr: ['a', 'b']}, 'arr[0]=a&arr[1]=b'],
  [{obj: {a: 'b', c: ['d', 'e']}}, 'obj[a]=b&obj[c][0]=d&obj[c][1]=e'],
])('stringifyQueryParams(%o) -> %o', (input, decodedOutput) => {
  const output = encodeURI(decodedOutput)
  expect(stringifyQueryParams(input)).toEqual(output)
  expect(parseQueryParams(output)).toEqual(input)
})
