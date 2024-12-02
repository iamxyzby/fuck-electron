# fuck-electron

[中文](README_CN.md) | English

If your Electron application reports the following error during installation:

- electron postinstall: `node install.js`
- RequestError: read ECONNRESET
- RequestError: connect ETIMEOUT

This is because Electron needs to download binary files from GitHub during installation. If no mirror or proxy is set up, it may fail due to network issues.

You can refer [Electron installation](https://www.electronjs.org/zh/docs/latest/tutorial/installation) to the solution, or you can use the following command.

```bash
npx fk-electron
```

> The naming inspired by [the fuck](https://github.com/nvbn/thefuck), If you feel offended, you can use the following command instead:

```bash
npx electron-nb
```

![alt text](niubi.jpg 'Title')

In chinese, NB(niubi) means "You are amazing!"

## Usage

You can use `npx fk-electron -h` for help message:

```bash
npx fk-electron -h

# result

Usage: [fk-electron|electron-nb] [OPTION]...

Download Electron binary files from npmmirror to /Users/xxx/Library/Caches/electron/

Options:
  -h, --help                             display help message and exit
  -v, --version                          specify version (default: 33.1.0)
  -p, --platform [win32|darwin|linux]    specify platform (default: darwin)
  -a, --arch [arm64|x64|ia32]            specify architecture (default: arm64)
  -m, --mirror_base_url                  specify mirror base url (default: https://cdn.npmmirror.com/binaries/electron/)
```
