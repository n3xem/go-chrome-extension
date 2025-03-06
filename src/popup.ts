declare const Go: any; // wasm_exec.jsで定義されているGoオブジェクト

const go = new Go();

// Chrome拡張機能ではfetchの代わりにchrome.runtime.getURLを使用
const wasmURL = chrome.runtime.getURL('main.wasm');

WebAssembly.instantiateStreaming(
    fetch(wasmURL),
    go.importObject
).then((result) => {
    go.run(result.instance);
}).catch((err: Error) => {
    console.error('Failed to load WASM:', err);
}); 
