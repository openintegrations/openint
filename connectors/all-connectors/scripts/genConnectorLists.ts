/**
 * We have to generate the connector list into actual files because webpack / next.js is extremely not performant
 * when importing modules with dynamic paths at runtime
 */

import * as fs from 'node:fs'
import {join as pathJoin} from 'node:path'
import {camelCase} from '@openint/util/string-utils'
import {writePretty} from './writePretty'

async function generateCnextIndex() {
  const cnextPath = pathJoin(__dirname, '../../../connectors/cnext')
  const cnextConnectors = fs
    .readdirSync(cnextPath, {
      withFileTypes: true,
    })
    .filter(
      (r) =>
        r.isDirectory() &&
        r.name !== 'def' &&
        !r.name.startsWith('.') &&
        r.name !== 'node_modules' &&
        !r.name.startsWith('_'),
    )

  await writePretty(
    'index.ts',
    `export type {JsonConnectorDef} from './def'
    export type {AuthType} from './def'

    ${cnextConnectors
      .map((d) => {
        const connectorName = `connector${d.name
          .charAt(0)
          .toUpperCase()}${camelCase(d.name.slice(1))}`
        return `import {server as ${connectorName}_server} from './${d.name}'
        import {def as ${connectorName}_def} from './${d.name}/def'`
      })
      .join('\n')}

    export {
      ${cnextConnectors
        .map((d) => {
          const connectorName = `connector${d.name
            .charAt(0)
            .toUpperCase()}${camelCase(d.name.slice(1))}`
          return `${connectorName}_server, ${connectorName}_def`
        })
        .join(',\n      ')}
    }`,
    cnextPath,
  )
}

type ConnectorImports = {
  def?: string
  client?: string
  server?: string
}

type ConnectorImportPath = {
  def?: string
  server?: string
  client?: string
}

type Connector = {
  name: string | undefined
  dirName: string
  varName: string
  imports: ConnectorImports
  importPath?: ConnectorImportPath
}

const connectorList: Connector[] = [
  ...fs
    .readdirSync(pathJoin(__dirname, '../../../connectors'), {
      withFileTypes: true,
    })
    .filter(
      (r) =>
        r.isDirectory() && r.name !== 'cnext' && r.name !== 'all-connectors',
    )
    .map((d) => {
      const path = pathJoin(__dirname, '../../../connectors', d.name)
      const def = fs.existsSync(pathJoin(path, 'def.ts'))
        ? // TODO: Automate generation of package.json is still needed, otherwise does not work for new packages
          // @see https://share.cleanshot.com/wDmqwsHS
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (require(`@openint/${d.name}/def`).default as any)
        : undefined
      // we do some validation also

      if (def && `connector-${def.name}` !== d.name) {
        throw new Error(`Mismatched connector: ${def.name} dir: ${d.name}`)
      }
      if (!def?.name) {
        console.warn(`Missing def for connector at: ${d.name}`)
        return null
      }
      return {
        name: def?.name,
        dirName: d.name,
        varName: camelCase(d.name),
        imports: {
          def: fs.existsSync(pathJoin(path, 'def.ts'))
            ? `@openint/${d.name}/def`
            : undefined,
          client: fs.existsSync(pathJoin(path, 'client.ts'))
            ? `@openint/${d.name}/client`
            : undefined,
          server: fs.existsSync(pathJoin(path, 'server.ts'))
            ? `@openint/${d.name}/server`
            : undefined,
        },
      } satisfies Connector
    })
    .filter((c): c is NonNullable<typeof c> => !!c),

  // Add cnext connectors
  ...fs
    .readdirSync(pathJoin(__dirname, '../../../connectors/cnext'), {
      withFileTypes: true,
    })
    .filter(
      (r) =>
        r.isDirectory() &&
        r.name !== 'def' &&
        !r.name.startsWith('.') &&
        r.name !== 'node_modules' &&
        !r.name.startsWith('_'),
    )
    .map((d) => {
      const connectorName = `connector${d.name.charAt(0).toUpperCase()}${camelCase(
        d.name.slice(1),
      )}`
      return {
        name: d.name,
        dirName: `cnext-${d.name}`,
        varName: connectorName,
        imports: {
          def: `@openint/cnext`,
          server: `@openint/cnext`,
          // Using specific import path selectors for def and server
          importPath: {
            def: `${connectorName}_def`,
            server: `${connectorName}_server`,
          },
        },
      }
    }),
]

async function main() {
  // Generate the cnext index.ts first
  await generateCnextIndex()

  await writePretty(
    'meta.ts',
    `
  export default ${JSON.stringify(
    Object.fromEntries(connectorList.map((c) => [c.name, c])),
  )}
  `,
  )

  const entries = ['def', 'client', 'server'] as const

  for (const entry of entries) {
    const list = connectorList.filter(
      (int) => !!int.imports[entry as keyof typeof int.imports],
    )
    if (entry === 'client') {
      await writePretty(
        `connectors.${entry}.ts`,
        `export const clientConnectors = {${list
          .sort((a, b) => a.name?.localeCompare(b.name || '') || 0)
          .map(
            ({name}) =>
              `'${name}': () => import('@openint/connector-${name}/client'),`,
          )
          .join('\n')}}`,
      )
    } else {
      await writePretty(
        `connectors.${entry}.ts`,
        `${list
          .map((int) => {
            // Check if this is a cnext connector
            const isCnext = int.dirName.startsWith('cnext-')
            if (isCnext) {
              const importPathSelector =
                int.importPath?.[entry as keyof typeof int.importPath] ||
                `${int.varName}_${entry}`
              return `import {${importPathSelector} as ${int.varName}} from '${
                int.imports[entry as keyof typeof int.imports]
              }'`
            }
            return `import {default as ${int.varName}} from '${
              int.imports[entry as keyof typeof int.imports]
            }'`
          })
          .join('\n')}
      export const ${entry}Connectors = {${list
        .sort((a, b) => a.name?.localeCompare(b.name || '') || 0)
        .map(({name, varName}) => `'${name}': ${varName},`)
        .join('\n')}}
    `,
      )
    }
  }

  // const mergedlist = connectorList.filter((int) =>
  //   Object.values(int.imports).some((v) => !!v),
  // )

  // await writePretty(
  //   'connectors.merged.ts',
  //   `${mergedlist
  //     .flatMap((int) => {
  //       const validImports = Object.fromEntries(
  //         Object.entries(int.imports)
  //           .filter(([, v]) => !!v)
  //           // Temp hack because mergedConnectors are only ever used server side
  //           // This avoids server needing to import client side code unnecessarily
  //           .filter(([k]) => k !== 'client'),
  //       )
  //       // Check if this is a cnext connector
  //       const isCnext = int.dirName.startsWith('cnext-')

  //       // Only get the valid import keys that should be imported and spread
  //       const importKeys = Object.keys(validImports)

  //       return [
  //         isCnext
  //           ? `import {${importKeys
  //               .map(
  //                 (k) =>
  //                   int.importPath?.[k as keyof typeof int.importPath] ||
  //                   `${int.varName}_${k}`,
  //               )
  //               .join(', ')}} from '${validImports['def']}'`
  //           : Object.entries(validImports)
  //               .map(
  //                 ([k, v]) =>
  //                   `import {default as ${int.varName}_${k}} from '${v}'`,
  //               )
  //               .join('\n'),
  //         `const ${int.varName} = {
  //           ${importKeys.map((k) => `...${int.varName}_${k}`).join(',')}
  //         }`,
  //       ]
  //     })
  //     .join('\n')}

  //   export const mergedConnectors = {${mergedlist
  //     .map(({name, varName}) => {
  //       // Skip node_modules
  //       if (name === 'node_modules') return null
  //       return `'${name?.toLowerCase().replace(/-/g, '')}': ${varName},`
  //     })
  //     .filter(Boolean)
  //     .join('\n')}}
  // `,
  // )
}

void main()
