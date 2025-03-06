// バックグラウンドスクリプトでメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TEXT_ELEMENTS') {
        console.log('Received text elements from content script:');

        // 全てのテキストを"hoge"に変更
        const modifiedElements = message.data.map((element: { text: string }) => ({
            ...element,
            text: 'hoge'
        }));

        console.log('Modified elements:');
        console.log(JSON.stringify(modifiedElements, null, 2));

        // content scriptに送り返す
        if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, {
                type: 'MODIFIED_TEXT_ELEMENTS',
                data: modifiedElements
            });
        }
    }
    return true;
}); 
