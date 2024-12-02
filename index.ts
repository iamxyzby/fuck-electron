#!/usr/bin/env bun

import fs from 'fs'
import path from 'path'
import os from 'os'
import semver from 'semver'
import https from 'https'
import ora from 'ora'
import minimist from 'minimist'
import { mkdirp } from 'mkdirp'
import { exec, execSync } from 'child_process'
import { readPackage } from 'read-pkg'

interface ArgvType {
  help: boolean
  platform: string
  arch: string
  version: string
  mirror_base_url: string
  d: boolean
  _: string[]
}

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    p: 'platform',
    a: 'arch',
    v: 'version',
    m: 'mirror_base_url'
  },
  boolean: ['help']
}) as ArgvType

const MIRROR_URL = 'https://cdn.npmmirror.com/binaries/electron/'

function getPackageVersion(packageName: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const command = `npm show ${packageName} versions`

    exec(command, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(error)
        return
      }
      const str = stdout.trim()
      let arr: string[]
      eval(`arr = ${str}`)
      // @ts-ignore
      resolve(arr)
    })
  })
}
const getConfig = () => {
  const platform = process.env.npm_config_platform || process.platform
  let arch = argv.arch || process.env.npm_config_arch || process.arch

  if (
    !argv.arch &&
    platform === 'darwin' &&
    process.platform === 'darwin' &&
    arch === 'x64' &&
    process.env.npm_config_arch === undefined
  ) {
    // When downloading for macOS ON macOS and we think we need x64 we should
    // check if we're running under rosetta and download the arm64 version if appropriate
    try {
      const output = execSync('sysctl -in sysctl.proc_translated')
      if (output.toString().trim() === '1') {
        arch = 'arm64'
      }
    } catch {
      // Ignore failure
    }
  }

  return {
    platform: argv.platform || platform,
    currentPlatform: platform,
    arch
  }
}
const getArtifactRemoteUrl = (config: { platform: string; arch: string; version: string }) => {
  const { platform, arch, version } = config
  const url = path.join(
    argv.mirror_base_url || MIRROR_URL,
    version,
    `electron-v${version}-${platform}-${arch}.zip`
  )

  return url
}
const getTargetPath = (platform: string) => {
  let result: string

  if (platform === 'darwin') {
    result = path.join(os.homedir(), 'Library/Caches/electron/')
  } else if (platform === 'win32') {
    result = path.join(os.homedir(), 'AppData/Local/electron/Cache/')
  } else if (platform === 'linux') {
    result = path.join(os.homedir(), '.cache/electron/')
  } else {
    console.error(`error: Unsupported platform: ${platform}`)
    process.exit(1)
  }
  if (!fs.existsSync(result)) {
    try {
      mkdirp.sync(result)
    } catch (error) {
      console.info(error)
      process.exit(1)
    }
  }

  return result
}

const downloadFile = async (url: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath)

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          fs.unlink(outputPath, () =>
            reject(new Error(`Failed to get '${url}' (${response.statusCode})`))
          )
          return
        }

        response.pipe(file)

        file.on('finish', () => {
          file.close(() => {
            resolve()
          })
        })

        file.on('error', (err) => {
          fs.unlink(outputPath, () => reject(err))
        })
      })
      .on('error', (err) => {
        fs.unlink(outputPath, () => reject(err))
      })
  })
}

const helpMsg = (v: string, destPath: string) => `\
Usage: [fk-electron|electron-nb] [OPTION]... 

Download Electron binary files from npmmirror to ${destPath}

Options:
  -h, --help                             display help message and exit
  -v, --version                          specify version (default: ${v})
  -p, --platform [win32|darwin|linux]    specify platform (default: ${process.platform})
  -a, --arch [arm64|x64|ia32]            specify architecture (default: ${process.arch})
  -m, --mirror_base_url                  specify mirror base url (default: ${MIRROR_URL})
`

const run = async () => {
  console.info(process.argv)
  const config = getConfig()
  const targetDir = getTargetPath(config.currentPlatform)
  const pkg = await readPackage()
  const name = 'electron'
  const versionRange = argv?.d
    ? '33.1.0'
    : pkg?.dependencies?.[name] || pkg?.devDependencies?.[name] || pkg.peerDependencies?.[name]

  if (argv.help) {
    console.info(helpMsg(versionRange || '-', targetDir))
    return
  }
  if (!argv.version && !versionRange) {
    console.error(`error: No version specified for specifier "${name}"`)
    process.exit(1)
  }

  const versions = await getPackageVersion(name)
  if (!versions) {
    console.error(`error: Get ${name} versions failed.`)
    process.exit(1)
  }

  const actualVersionRange = argv.version || versionRange
  const installedVersion = semver.maxSatisfying(versions, actualVersionRange!)
  if (!installedVersion) {
    console.info(
      `error No version matching "${actualVersionRange}" found for specifier "${name}" (but package exists)`
    )
    process.exit(1)
  }

  const url = getArtifactRemoteUrl({ ...config, version: installedVersion })
  const targetFilePath = path.join(targetDir, path.basename(url))

  if (fs.existsSync(targetFilePath)) {
    console.warn(`warning: ${path.basename(url)} already exists.`)
    process.exit(0)
  }

  const spinner = ora().start(`Downloading ${path.basename(url)} from ${url}`)
  await downloadFile(url, targetFilePath)
  spinner.succeed('Download complete')
}

run()
