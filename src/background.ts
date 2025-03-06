declare function importScripts(...urls: string[]): void;
declare const Go: any; // wasm_exec.jsで定義されているGoオブジェクト
declare function process_text_elements(json: string): string;
importScripts('wasm_exec.js');
const go = new Go();
const wasmURL = chrome.runtime.getURL('main.wasm');

// WebAssemblyの初期化
WebAssembly.instantiateStreaming(
    fetch(wasmURL),
    go.importObject
).then((result) => {
    go.run(result.instance);
    console.log('WASM initialized successfully');
}).catch((err: Error) => {
    console.error('Failed to load WASM:', err);
});

// バックグラウンドスクリプトでメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TEXT_ELEMENTS') {
        console.log('Received text elements from content script:');

        try {
            // WebAssemblyで処理
            const jsonString = JSON.stringify(message.data);
            const processedJsonString = process_text_elements(jsonString);
            const processedElements = JSON.parse(processedJsonString);

            console.log('Processed elements by WASM:');
            console.log(processedElements);

            // content scriptに送り返す
            if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: 'MODIFIED_TEXT_ELEMENTS',
                    data: processedElements
                });
            }
        } catch (error) {
            console.error('Error processing with WASM:', error);
        }
    }
    return true;
}); 
