# PybricksHub.js

PybricksHub.js is a driver to connect the hub by LEGO with the [Pybricks](https://pybricks.com/) firmware. (forked from [pybricks-code](https://github.com/pybricks/pybricks-code))

## Demo

- [PybricksHub test](https://code4fukui.github.io/PybricksHub.js/)

## Usage

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

## Dependencies

- [mpy-cross-v6 ES modules](https://github.com/code4fukui/mpy-cross-v6)
