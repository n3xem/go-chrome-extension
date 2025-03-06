package main

import (
	"encoding/json"
	"syscall/js"
)

func ProcessTextElements(_ js.Value, args []js.Value) any {
	// JSON文字列を入力値として受け取る
	jsonStr := args[0].String()

	// JSON文字列をデコード
	var elements []map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &elements); err != nil {
		return "Error: " + err.Error()
	}

	// 各要素のtextフィールドを"hoge"に変更
	for i := range elements {
		elements[i]["text"] = "hoge"
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
