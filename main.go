package main

import (
	"encoding/json"
	"strings"
	"syscall/js"

	"github.com/hackebrot/turtle"
)

func ProcessTextElements(_ js.Value, args []js.Value) any {
	// JSON文字列を入力値として受け取る
	jsonStr := args[0].String()

	// JSON文字列をデコード
	var elements []map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &elements); err != nil {
		return "Error: " + err.Error()
	}

	// 各要素のtextフィールドを処理
	for i := range elements {
		if text, ok := elements[i]["text"].(string); ok {
			// テキストをスペースで分割
			words := strings.Split(text, " ")
			var resultWords []string

			// 各単語に対して絵文字検索を実行
			for _, word := range words {
				emojis := turtle.Search(word)
				if len(emojis) > 0 {
					resultWords = append(resultWords, emojis[0].Char)
				} else {
					resultWords = append(resultWords, word)
				}
			}

			// 処理した単語を再度結合
			elements[i]["text"] = strings.Join(resultWords, " ")
		}
	}

	// 変更したデータをJSON文字列に戻す
	result, err := json.Marshal(elements)
	if err != nil {
		return "Error: " + err.Error()
	}

	return string(result)
}

func main() {
	c := make(chan struct{}, 0)

	// JavaScript側からGoの関数ProcessTextElementsを
	// process_text_elementsという名前で呼び出せるように登録
	js.Global().Set("process_text_elements", js.FuncOf(ProcessTextElements))

	<-c
}
