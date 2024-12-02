import { build } from 'bun'
import path from 'path'
import fs from 'fs'

const setSheBang = (value: 'node' | 'bun', targetFile: string) => {
  const sheBangMaps = {
    node: '#!/usr/bin/env node',
    bun: '#!/usr/bin/env bun'
  }
  let content = fs.readFileSync(targetFile, 'utf8')
  content = content.replace(/^#!.*/, sheBangMaps[value])
  fs.writeFileSync(targetFile, content, 'utf8')
}

const run = () => {
  const entry = path.resolve(__dirname, './index.ts')

  setSheBang('node', entry)
  build({
    entrypoints: [entry],
    outdir: path.resolve(__dirname, './bin'),
    minify: true,
    format: 'esm',
    target: 'node'
  }).finally(() => {
    setSheBang('bun', entry)
  })
}

run()
