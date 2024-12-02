# fuck-electron

如果您的 Electron 应用在 `install` 时报以下错误：

- electron postinstall: `node install.js`
- RequestError: read ECONNRESET
- RequestError: connect ETIMEOUT

是因为 Electron 在 `install` 时需要下载位于 Github 上的二进制文件，如果没有设置镜像或者代理时，很有可能因为网络问题而导致失败。

您可以参考 [安装指导](https://www.electronjs.org/zh/docs/latest/tutorial/installation) 解决，也可以使用本仓库提供的命令行工具，如下所示：

```bash
npx fuck-electron
# Or bun
bunx fuck-electron
```

> 命名灵感来自 [the fuck](https://github.com/nvbn/thefuck)，如果您感到被冒犯可以使用以下命令代替：

```bash
npx electron-niubi
# Or bun
bunx electron-niubi
```

命令会自动解析 Electron 所需版本和平台，在 [npmmirror](https://registry.npmmirror.com/binary.html?path=electron) 下载对应的二进制文件到缓存目录中。

<!-- ![alt text](niubi.jpg 'Title') -->

## 使用

您可以使用 `npx fuck-electron -h` 查看帮助信息：

```bash
npx fuck-electron -h

# result

Usage: [fuck-electron|electron-niubi] [OPTION]...

Download Electron binary files from npmmirror to /Users/xxx/Library/Caches/electron/

Options:
  -h, --help                             display help message and exit
  -v, --version                          specify version (default: 33.1.0)
  -p, --platform [win32|darwin|linux]    specify platform (default: darwin)
  -a, --arch [arm64|x64|ia32]            specify architecture (default: arm64)
  -m, --mirror_base_url                  specify mirror base url (default: https://cdn.npmmirror.com/binaries/electron/)
```
