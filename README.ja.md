# PybricksHub.js

PybricksHub.js は LEGO の Hub を [Pybricks](https://pybricks.com/) ファームウェアと接続するためのドライバーです。(forked from [pybricks-code](https://github.com/pybricks/pybricks-code))

## デモ

- [PybricksHub test](https://code4fukui.github.io/PybricksHub.js/)
- [PybricksHub test in JS](https://code4fukui.github.io/PybricksHub.js/js.html) (with [JS2Py](https://github.com/code4fukui/js2py/))

## 機能

- LEGO の Hub と Pybricks ファームウェアの接続
- プログラムのアップロードと実行
- REPL (対話型プログラミング)

## 必要環境

- Web ブラウザ (WebBluetooth 対応が必要)

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

## ライセンス

MIT License