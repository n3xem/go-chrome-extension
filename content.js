// テキストを持つ可能性のある要素のセレクタ
const TEXT_ELEMENTS_SELECTOR = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'div', 'span', 'a', 'label', 'li',
    'td', 'th', 'caption',
    'button', 'figcaption',
    'article', 'section', 'header', 'footer',
    'blockquote', 'cite', 'q',
    'strong', 'em', 'b', 'i',
    'title', 'summary', 'details'
].join(',');

// テキストコンテンツを持つ要素を収集して出力
function collectTextElements(root) {
    let textElements = [];

    // テキストを持つ可能性のある要素を選択
    const elements = root.querySelectorAll(TEXT_ELEMENTS_SELECTOR);

    elements.forEach(element => {
        // 直接のテキストノードのみを確認（子要素のテキストは除外）
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    // 親要素のセレクタを含めたフルパスを生成
                    const fullPath = [];
                    let currentElement = element;
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

                    textElements.push({
                        text: text,
                        fullPath: fullPath.join(' > '),
                        index: Array.from(element.parentElement.children)
                            .filter(e => e.tagName === element.tagName)
                            .indexOf(element)
                    });
                    break; // 同じ要素の他のテキストノードは無視
                }
            }
        }
    });

    return textElements;
}

// 結果をJSONとしてコンソールに出力
function logTextElements() {
    const elements = collectTextElements(document.documentElement);
    console.log(JSON.stringify(elements, null, 2));
}

// ページ読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Logging text elements:');
    logTextElements();
});

// 動的な変更を監視
const observer = new MutationObserver((mutations) => {
    // テキスト要素に関連する変更のみを処理
    const relevantMutation = mutations.some(mutation => {
        const target = mutation.target;
        return target.matches &&
            (target.matches(TEXT_ELEMENTS_SELECTOR) ||
                target.closest(TEXT_ELEMENTS_SELECTOR));
    });

    if (relevantMutation) {
        console.log('Text Elements Changed - Logging text elements:');
        logTextElements();
    }
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
}); 
