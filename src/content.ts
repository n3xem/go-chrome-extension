// テキストを持つ可能性のある要素のセレクタ
const TEXT_ELEMENTS_SELECTOR: string = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'span', 'a', 'label', 'li',
    'td', 'th', 'caption',
    'button', 'figcaption',
    'article', 'section', 'header', 'footer',
    'blockquote', 'cite', 'q',
    'strong', 'em', 'b', 'i',
    'title', 'summary', 'details'
].join(',');

interface TextElement {
    text: string;
    fullPath: string;
    index: number;
}

// テキストコンテンツを持つ要素を収集して出力
function collectTextElements(root: HTMLElement): TextElement[] {
    const textElements: TextElement[] = [];

    // テキストを持つ可能性のある要素を選択
    const elements = root.querySelectorAll(TEXT_ELEMENTS_SELECTOR);

    elements.forEach((element: Element) => {
        let hasProcessedText = false;
        Array.from(element.childNodes).forEach(node => {
            if (!hasProcessedText && node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim() || '';
                if (text) {
                    // 親要素のセレクタを含めたフルパスを生成
                    const fullPath: string[] = [];
                    let currentElement: Element | null = element;

                    while (currentElement && currentElement !== document.documentElement) {
                        let currentSelector = currentElement.tagName.toLowerCase();
                        if (currentElement.id) {
                            currentSelector += `#${currentElement.id}`;
                            fullPath.unshift(currentSelector);
                            break; // IDがある場合はそこで停止（一意に特定できるため）
                        } else if (currentElement.className) {
                            currentSelector += currentElement.className.split(' ')
                                .filter(c => c)
                                .map(c => `.${c}`)
                                .join('');
                        }
                        fullPath.unshift(currentSelector);
                        currentElement = currentElement.parentElement;
                    }

                    const parentElement = element.parentElement;
                    const index = parentElement
                        ? Array.from(parentElement.children)
                            .filter(e => e.tagName === element.tagName)
                            .indexOf(element)
                        : -1;

                    textElements.push({
                        text,
                        fullPath: fullPath.join(' > '),
                        index
                    });
                    hasProcessedText = true;
                }
            }
        });
    });

    return textElements;
}

// バックグラウンドからの応答を受信
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'MODIFIED_TEXT_ELEMENTS') {
        console.log('Received modified elements from background:');
        console.log(JSON.stringify(message.data, null, 2));

        // 実際のDOM要素のテキストを更新
        message.data.forEach((element: TextElement) => {
            const domElement = document.querySelector(element.fullPath);
            if (domElement) {
                // 直接のテキストノードのみを更新
                for (const node of Array.from(domElement.childNodes)) {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                        node.textContent = element.text;
                        break;
                    }
                }
            }
        });
    }
});

// 結果をJSONとしてバックグラウンドスクリプトに送信
function sendTextElements(): void {
    const elements = collectTextElements(document.documentElement);
    chrome.runtime.sendMessage({
        type: 'TEXT_ELEMENTS',
        data: elements
    });
}

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Sending text elements');
    sendTextElements();
});

// 動的な変更を監視
const observer = new MutationObserver((mutations: MutationRecord[]) => {
    // テキスト要素に関連する変更のみを処理
    const relevantMutation = mutations.some(mutation => {
        const target = mutation.target as Element;
        return target.matches &&
            (target.matches(TEXT_ELEMENTS_SELECTOR) ||
                target.closest(TEXT_ELEMENTS_SELECTOR));
    });

    if (relevantMutation) {
        console.log('Text Elements Changed - Sending text elements');
        sendTextElements();
    }
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
}); 
