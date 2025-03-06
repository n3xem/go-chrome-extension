server:
	python3 -m http.server 8000

build:
	GOOS=js GOARCH=wasm GOTOOLCHAIN=go1.23.7 go build -o main.wasm main.go
