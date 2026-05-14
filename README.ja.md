# PybricksHub.js

PybricksHub.js は、[Pybricks](https://pybricks.com/) ファームウェアを搭載した LEGO ハブに接続するためのドライバーです（[pybricks-code](https://github.com/pybricks/pybricks-code) からフォークされました）。

## デモ

- [PybricksHub test](https://code4fukui.github.io/PybricksHub.js/)
- [PybricksHub test in JS](https://code4fukui.github.io/PybricksHub.js/js.html) ([JS2Py](https://github.com/code4fukui/js2py/) を使用)

## 使い方

```JavaScript
import { PybricksHub } from "https://code4fukui.github.io/PybricksHub.js/PybricksHub.js";

const hub = new PybricksHub();
hub.setReceiver(s => {
  taout.value += s;
  taout.scrollTop = taout.scrollHeight;
});
btnconnect.onclick = async () => {
  await hub.connect();
  await hub.startREPL();
};
```

## 依存関係

- [mpy-cross-v6 ES modules](https://github.com/code4fukui/mpy-cross-v6)

## ライセンス

MIT License — 詳細は [LICENSE](LICENSE) を参照してください。
