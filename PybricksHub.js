// based on pybricks-code https://github.com/pybricks/pybricks-code

import { compilePy } from "./compilePy.js";

/** Pybricks service UUID. */
export const pybricksServiceUUID = "c5f50001-8280-46da-89f4-6d8051e4aeef";
/** Pybricks control/event characteristic UUID. */
export const pybricksControlEventCharacteristicUUID = "c5f50002-8280-46da-89f4-6d8051e4aeef";
/** Pybricks hub capabilities characteristic UUID. */
export const pybricksHubCapabilitiesCharacteristicUUID = "c5f50003-8280-46da-89f4-6d8051e4aeef";

/** Device Information service UUID. */
export const deviceInformationServiceUUID = 0x180a;

/** Firmware Revision String characteristic UUID. */
export const firmwareRevisionStringUUID = 0x2a26;

/** Software Revision String characteristic UUID. */
export const softwareRevisionStringUUID = 0x2a28;

/** PnP ID characteristic UUID. */
export const pnpIdUUID = 0x2a50;

/** nRF UART Service UUID. */
export const nordicUartServiceUUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

/** nRF UART RX Characteristic UUID. Supports Write or Write without response. */
export const nordicUartRxCharUUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

/** nRF UART TX Characteristic UUID. Supports Notifications. */
export const nordicUartTxCharUUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

/**
 * This is the largest data size for the TX characteristic that is safe to use
 * when the negotiated MTU is unknown.
 */
export const nordicUartSafeTxCharLength = 20;

export function decodePnpId(data) {
  return {
    vendorIdSource: data.getUint8(0),
    vendorId: data.getUint16(1, true),
    productId: data.getUint16(3, true),
    productVersion: data.getUint16(5, true),
  };
};

export const CommandType = {
  /** Request to stop the user program, if it is running. */
  StopUserProgram: 0,
  /** Request to start the user program. */
  StartUserProgram: 1,
  /** Request to start the interactive REPL. */
  StartRepl: 2,
  /** Request to write user program metadata. */
  WriteUserProgramMeta: 3,
  /** Request to write to user RAM. */
  WriteUserRam: 4,
  /** Request to reboot in firmware update mode. */
  ResetInUpdateMode: 5,
};

const decoder = new TextDecoder();

export function createWriteUserProgramMetaCommand(size) {
  const msg = new Uint8Array(5);
  const view = new DataView(msg.buffer);
  view.setUint8(0, CommandType.WriteUserProgramMeta);
  view.setUint32(1, size, true);
  return msg;
};
export function createWriteUserRamCommand(offset, payload) {
  const msg = new Uint8Array(5 + payload.byteLength);
  const view = new DataView(msg.buffer);
  view.setUint8(0, CommandType.WriteUserRam);
  view.setUint32(1, offset, true);
  msg.set(new Uint8Array(payload), 5);
  return msg;
};

export class PybricksHub {
  async connect() {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [pybricksServiceUUID] }],
      optionalServices: [
          pybricksServiceUUID,
          deviceInformationServiceUUID,
          nordicUartServiceUUID,
      ],
    });
    const gatt = this.device.gatt;
    const server = await gatt.connect();
    const deviceInfoService = await server.getPrimaryService(deviceInformationServiceUUID);
    const firmwareVersionChar = await deviceInfoService.getCharacteristic(firmwareRevisionStringUUID);
    const firmwareRevision = decoder.decode(await firmwareVersionChar.readValue());
    const softwareVersionChar = await deviceInfoService.getCharacteristic(softwareRevisionStringUUID);
    const softwareRevision = decoder.decode(await softwareVersionChar.readValue());
    const pnpIdChar = await deviceInfoService.getCharacteristic(pnpIdUUID);
    const pnpId = decodePnpId(await pnpIdChar.readValue());
    const pybricksService = await server.getPrimaryService(pybricksServiceUUID);
    const pybricksControlChar = await pybricksService.getCharacteristic(pybricksControlEventCharacteristicUUID);

    const pblistener = () => {
      if (!pybricksControlChar.value) {
          return;
      }
      //console.log("pybrick", pybricksControlChar.value);
    };
    pybricksControlChar.addEventListener("characteristicvaluechanged", pblistener);
    await pybricksControlChar.stopNotifications();
    await pybricksControlChar.startNotifications();

    const pybricksHubCapabilitiesChar = await pybricksService.getCharacteristic(pybricksHubCapabilitiesCharacteristicUUID);
    const hubCapabilitiesValue = await pybricksHubCapabilitiesChar.readValue();
    this.maxWriteSize = hubCapabilitiesValue.getUint16(0, true);
    const flags = hubCapabilitiesValue.getUint32(2, true);
    this.maxUserProgramSize = hubCapabilitiesValue.getUint32(6, true);
    console.log("version", softwareRevision, this.maxWriteSize, flags, this.maxUserProgramSize);

    const uartService = await server.getPrimaryService(nordicUartServiceUUID);
    const uartRxChar = await uartService.getCharacteristic(nordicUartRxCharUUID);
    const uartTxChar = await uartService.getCharacteristic(nordicUartTxCharUUID);
    const listener = () => {
      if (!uartTxChar.value) {
          return;
      }
      if (this.outputf) {
        const bin = new Uint8Array(uartTxChar.value.buffer);
        if (this.outputbin) {
          this.outputf(bin);
        } else {
          this.outputf(decoder.decode(bin));
        }
      }
    };
    uartTxChar.addEventListener("characteristicvaluechanged", listener);
    await uartTxChar.stopNotifications();
    await uartTxChar.startNotifications();

    this.server = server;
    this.uartRxChar = uartRxChar;
    this.uartTxChar = uartTxChar;
    this.pybricksControlChar = pybricksControlChar;
  }
  setReceiver(outputf, binary = false) {
    this.outputf = outputf;
    this.outputbin = binary;
  }
  async send(bin) {
    if (typeof bin == "string") {
      bin = new TextEncoder().encode(bin);
    }
    await this.uartRxChar.writeValueWithResponse(bin);
  }
  async startProgram() {
    await this.sendCommand(CommandType.StartUserProgram);
  }
  async stopProgram() {
    await this.sendCommand(CommandType.StopUserProgram);
  }
  async setProgram(prog) {
    const bin = typeof prog == "string" ? await compilePy(prog) : prog;
    if (bin.length > this.maxUserProgramSize) {
      throw new Error("prog is too learge, must be " + bin.length + " < " + this.maxUserProgramSize);
    }
    const msgmeta1 = createWriteUserProgramMetaCommand(0); // invalidate exists program
    await this.pybricksControlChar.writeValueWithResponse(msgmeta1.buffer);
    const chunkSize = this.maxWriteSize - 5; // 5 is size of header
    for (let i = 0; i < bin.length; i += chunkSize) {
      const buf = new Uint8Array(Math.min(chunkSize, bin.length - i));
      for (let j = 0; j < buf.length; j++) {
        buf[j] = bin[i + j];
      }
      const msgbody = createWriteUserRamCommand(i, buf.buffer);
      await this.pybricksControlChar.writeValueWithResponse(msgbody.buffer);
    }
    const msgmeta2 = createWriteUserProgramMetaCommand(bin.length);
    await this.pybricksControlChar.writeValueWithResponse(msgmeta2.buffer);
  }
  async startREPL() {
    await this.sendCommand(CommandType.StartRepl);
  }
  async sendCommand(ncmd) {
    const cmd = new Uint8Array([ncmd]);
    await this.pybricksControlChar.writeValueWithResponse(cmd.buffer);
  }
  async disconnect() {
    await this.server.disconnect();
  }
}
