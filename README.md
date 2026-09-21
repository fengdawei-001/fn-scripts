# 京东脚本合集（合并优化版）

`jdpro`（6dylan6/jdpro）与 `faker3`（shufflewzc/faker3）合并 + 优化后的自用版。

## 本项目做了什么

| 项 | 说明 |
|---|---|
| 合并 | 以 faker3 为基底，并入 jdpro 独有的脚本和库，共 **64 个脚本** |
| 去除互助 | 删除 6 个纯助力/互助脚本（种豆互助、农场助力、捕鱼助力等），自用不留帮人打工的脚本 |
| 清理后门 | 清理 12 个文件里混入的 `@redacted/enterprise-plugin` 等 AI 工具注入的遥测代码 |
| 抽离框架 | 把 64 个脚本里重复的 Env 框架抽成 `function/env_*.js` 共享模块（15 个版本），改一处全局生效 |
| 修复配置 | 重写 package.json（原 main 指向不存在的文件、repository 指向原项目），补齐缺失依赖声明 |

## 部署到青龙面板

### 方式 A：Docker

```bash
cd docker
docker compose up -d
# 浏览器打开 http://localhost:5700 初始化
```

### 方式 B：已有青龙面板（拉库，推荐）

在青龙「定时任务 → 新建任务」里，命令填：

```
ql repo https://github.com/fengdawei-001/fn-scripts.git "jd_" "backUp|config|docker|function|utils|node_modules|\.github" "sendNotify|jdCookie|USER_AGENTS|JS_USER_AGENTS|JDJRValidator|JDSignValidator|ql" "main"
```

> ⚠️ 白名单 `"jd_"` 和黑名单 `"backUp|config|docker|function|utils|..."` 是关键：
> - 白名单只匹配 `jd_` 开头的脚本，避免把 `function/`、`utils/` 里的库文件也扫成定时任务；
> - 黑名单把子目录和无关文件排除。
> - 如果仓库是私有的，把地址里的 `github.com` 换成 `用户名:token@github.com` 形式（token 用完记得撤销）。

拉库后青龙会自动：
1. 把脚本放进 scripts 目录，根据脚本头部 cron 注释自动生成定时任务；
2. `dependence` 里指定的 `sendNotify`/`jdCookie`/`USER_AGENTS` 等会被同步但**不生成任务**。

然后：
1. 面板「依赖管理 → Node.js」安装依赖，或直接在本目录执行 `npm install`。
2. 「环境变量」添加 `JD_COOKIE`，格式：`pt_key=xxx;pt_pin=yyy;`

## 注意事项

- **Cookie 会因京东风控失效**，失效后需重新获取。京东 `pt_key` 默认 72 小时生命周期，异常行为（并发、IP 漂移）会提前吊销。
- **仅限自用、使用自己账号的 Cookie**。获取/倒卖他人 Cookie 已属刑事犯罪（非法获取计算机信息系统数据罪）。
- `jd_ksjsb.js` 结构特殊（动态构造、ESM 加载），需要额外依赖 `axios`、`socks-proxy-agent`、`smallfawn`，已在 package.json 声明。
- 主脚本内部仍可能内置作者助力码（混淆代码无法安全精确删除），运行时会顺带为作者助力，此为上游脚本固有行为。

## 目录结构

```
├── jd_*.js            # 64 个京东任务脚本
├── function/
│   ├── env_*.js       # 抽离出的共用 Env 框架（15 个版本）
│   └── *.js           # 加密/签名/通知等共享库
├── utils/             # 工具库
├── docker/            # 青龙 Docker 部署文件
├── package.json       # 依赖声明（已修复）
└── sendNotify.js      # 消息推送
```

---

## 免责声明

* 本仓库涉及的解锁、解密分析脚本仅用于测试、学习与研究，禁止用于商业用途，其合法性、准确性、完整性、有效性无法保证。
* 本项目所有资源文件禁止任何公众号、自媒体以任何形式转载或发布。
* 任何用户间接使用脚本（包括但不限于建立 VPS、传播）时的行为若违反国家/地区法律或相关法规，本仓库不承担由此造成的任何隐私泄露或其他后果。
* 禁止将本项目的任何内容用于商业或非法用途，否则后果自负。

## 致谢

* [@NobyDa](https://github.com/NobyDa)
* [@chavyleung](https://github.com/chavyleung)
* [@liuxiaoyucc](https://github.com/liuxiaoyucc)
* [@Zero-S1](https://github.com/Zero-S1)
* [@uniqueque](https://github.com/uniqueque)
* [@nzw9314](https://github.com/nzw9314)
* [@Oreo](https://github.com/Oreomeow)
