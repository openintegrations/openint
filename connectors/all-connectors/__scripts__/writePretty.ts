import * as fs from 'node:fs'
import {join as pathJoin} from 'path/posix'
import prettier from 'prettier'
// Move prettier to its own project like eslint-config
// eslint-disable-next-line import-x/no-relative-packages
import prettierConfig from '../../../prettier.config'

export async function writePretty(
  filename: string,
  content: string,
  outputPath = pathJoin(__dirname, '../'),
  pretty = true,
) {
  fs.mkdirSync(outputPath, {recursive: true})

  fs.writeFileSync(
    pathJoin(outputPath, filename),
    !pretty
      ? content
      : await prettier
          .format(
            `
    // generated file. Do not modify by hand
    ${content}`,
            {...prettierConfig, parser: 'typescript'},
          )
          .catch((err) => {
            console.warn('Prettier failed to format file: ' + filename, err)
            return content
          }),
  )
}
