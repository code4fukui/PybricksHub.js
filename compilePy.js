import { compile } from "https://code4fukui.github.io/mpy-cross-v6/build/index.js";

const encoder = new TextEncoder();

const cString = (str) => encoder.encode(str + "\0");

const encodeUInt32LE = (value) => {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setUint32(0, value, true);
  return new Uint8Array(buf);
};

export const compilePy = async (prog) => {
  const module = "__main__";
  const wasmurl = "https://code4fukui.github.io/mpy-cross-v6/build/mpy-cross-v6.wasm";
  const bin = await compile(module + ".py", prog, null, wasmurl);
  console.log(bin);
  if (bin.err.length > 0) {
    throw new Error(bin.err);
  }
  const pack = [];
  pack.push(encodeUInt32LE(bin.mpy.length));
  pack.push(cString(module));
  pack.push(bin.mpy);
  const res = new Uint8Array(pack.reduce((pre, cur) => pre + cur.length, 0));
  let idx = 0;
  for (const p of pack) {
    for (let i = 0; i < p.length; i++) {
      res[idx++] = p[i];
    }
  }
  return res;
};
