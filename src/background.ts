// バックグラウンドスクリプトでメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TEXT_ELEMENTS') {
        console.log('Received text elements from content script:');
        console.log(JSON.stringify(message.data, null, 2));

        // オプション: 送信元のタブ情報も出力
        if (sender.tab) {
            console.log('From tab:', {
                url: sender.tab.url,
                title: sender.tab.title,
                id: sender.tab.id
            });
        }
    }
    return true;
}); 
