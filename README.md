# ニコニコマンダー
ニコニコ動画で動画の再生/停止や早送り/巻き戻しなどの機能をキーボードで操作できるようになる拡張機能です。Google Chrome で利用できます。

## ダウンロード
[ニコニコマンダー - Chrome ウェブストア](https://chrome.google.com/webstore/detail/%E3%83%8B%E3%82%B3%E3%83%8B%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%80%E3%83%BC/baiinihbicmkmkhblpboabkckgheaahm?utm_source=chrome-ntp-icon)

## 使い方
以下のようなショートカットキーが利用できるようになります。

* **K** または **space** - 再生/停止
* **H** または **0** - 動画の一番最初に移動する
* **E** - 動画の一番最後に移動する
* **J** または **左矢印** - 数秒戻る
* **L** または **右矢印** - 数秒進める
* **D** - 音量を下げる
* **U** - 音量を上げる
* **M** - ミュート/解除
* **R** - リピート再生/解除
* **V** - コメント表示/非表示
* **T** - 指定した時間にジャンプ
* **B** - 以前の再生位置に戻る
* **F** - フルスクリーンモード/解除
* **1** - 動画の10%の位置に移動する
* **2** - 動画の20%の位置に移動する
* **3** - 動画の30%の位置に移動する
* **4** - 動画の40%の位置に移動する
* **5** - 動画の50%の位置に移動する
* **6** - 動画の60%の位置に移動する
* **7** - 動画の70%の位置に移動する
* **8** - 動画の80%の位置に移動する
* **9** - 動画の90%の位置に移動する
* **CC** - コメントを入力する
* **esc** - フルスクリーンモード解除
* **esc** - フォーカスを外す

ショートカットキーは設定ページで変更することができます。

## 更新履歴
[CHANGELOG.md](https://github.com/noraworld/niconicommander/blob/master/CHANGELOG.md) を参照してください。

## FAQ
### Q: フルスクリーンモードをモニタサイズにしても本拡張機能でフルスクリーンにするとブラウザサイズで拡大されてしまう
A: ニコニコ動画で提供されているAPIではブラウザサイズでのフルスクリーンしかできない仕様になっています。そのためモニタサイズでの拡大に設定していても本拡張機能でフルスクリーンにするとブラウザサイズでの設定に上書きされてしまいます。あらかじめご了承ください。

### Q: コメントが入力できない / コメント欄にフォーカスできない
A: 本拡張機能ではクリックでのコメント欄へのフォーカスができません。コメントを入力するにはキーボードの c を2回押してください。コメント欄にフォーカスされ、コメントが入力できるようになります。コメント入力中はコマンドが無効化されます。再び有効にするには esc を押すかマウスで動画プレイヤー以外の任意の箇所をクリックしてください。
