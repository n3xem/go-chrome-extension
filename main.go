package main

import (
	"syscall/js"
)

func ProcessTextElements(_ js.Value, args []js.Value) any {
	// JSON文字列を入力値として受け取る
	jsonStr := args[0].String()
	// JSONオブジェクトをそのまま返す
	return jsonStr
}

func main() {
	c := make(chan struct{}, 0)

	// JavaScript側からGoの関数ProcessTextElementsを
	// process_text_elementsという名前で呼び出せるように登録
	js.Global().Set("process_text_elements", js.FuncOf(ProcessTextElements))

	<-c
}
