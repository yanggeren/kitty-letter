# 💌 一封给你的信 — Kitty Letter

一个可以分享到手机上打开的「信」网页:

- 打开网页 **自动播放背景音乐**;如果音乐文件缺失/损坏,会 **提示"播放失败"并自动移除音乐按钮**,页面其余功能不受影响
- 开场是 **Kitty 抱着信封飞过来** 的动画,飞到中间停下
- 点击 Kitty 怀里的信封 → **信封界面**(此界面不显示"重新折好信件"按钮)
- 点击信封 → 封盖翻开,**信纸展开**;页面底部出现 **「重新折好信件」** 按钮
- 点击「重新折好信件」→ 信纸折叠回到信封,按钮自动隐藏
- 信纸页面有 Kitty 元素,信纸四周环绕着 **各种颜色的爱心 Kitty**
- 全站零外部依赖(不加载 Google 字体/CDN),手机端、弱网也能正常打开

## 📁 结构

```
kitty-letter/
├── index.html          # 页面结构(信的内容在这里改 ✏️)
├── css/style.css       # 样式与动画
├── js/main.js          # 交互逻辑、音乐容错、爱心Kitty注入
└── assets/
    └── bgm.mp3         # 背景音乐(原创八音盒旋律,可替换)
```

## ✏️ 自定义

### 改信的内容

打开 `index.html`,找到 `<!-- ✏️ 想改信的内容,就改下面这一块 -->`,修改:
- `.letter__date` 的日期
- `.letter__title` 的称呼
- `.letter__body` 里的段落(想加几段都可以)
- `.letter__sign` 的落款

### 换音乐

把你的音乐命名为 `assets/bgm.mp3` 覆盖即可(建议 ≤ 5MB、时长 1~3 分钟)。
音乐文件**必须放在这个路径**,否则页面会提示"播放失败"并隐藏音乐按钮(这是设计好的容错行为)。

### 颜色与文字

- 主色在 `css/style.css` 顶部的 `:root` 变量里(`--pink`、`--red`、`--berry` 等)
- 信纸周围的爱心 Kitty 数量/位置/大小在 `js/main.js` 的 `SPOTS` 数组里

## 🚀 部署到 GitHub Pages

1. 在 GitHub 新建一个仓库(比如 `kitty-letter`),**不要**勾选 README
2. 在本目录执行:

   ```bash
   git init
   git add .
   git commit -m "💌 kitty letter"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/kitty-letter.git
   git push -u origin main
   ```

   (第一次 push 会要求登录 GitHub;建议用 Personal Access Token 或 SSH key)

3. 打开仓库页面 → **Settings → Pages** → Source 选 `Deploy from a branch`,Branch 选 `main / (root)` → Save
4. 一两分钟后,页面地址是:
   `https://<你的用户名>.github.io/kitty-letter/`
5. 把链接发给对方,手机浏览器直接打开即可 📱

> 小提示:GitHub Pages 生成的链接是公开的(任何拿到链接的人都能看),介意的话可以用
> GitHub 的私有仓库 + Pages Pro,或换成私人网盘/对象存储托管。

## 📱 关于手机上的自动播放

手机浏览器(iOS/部分安卓)出于省电策略会拦截"带声音的自动播放",处理方式:

- 页面加载后会**立即尝试播放**;如果被浏览器拦下,会在你**第一次点击/触摸页面时自动补播**(点 Kitty 拆信那一刻,音乐就响了)
- 右上角的「音乐」按钮可以随时手动播放/暂停
- 只有当**音乐文件真的不存在/损坏**时,才会提示播放失败并隐藏按钮

## 🐱 素材说明

页面里的 Kitty 形象是本项目手绘的原创 SVG 小猫(白色小猫 + 红色蝴蝶结 + 爱心元素),不包含任何第三方图片素材;背景音乐为脚本合成的原创八音盒旋律,可放心公开分享。
