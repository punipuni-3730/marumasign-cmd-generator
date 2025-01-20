// すべてのリクエストパラメーター取得
const urlParams = new URLSearchParams(window.location.search);

// "v"という名前のリクエストパラメーター取得
const version = urlParams.get("v");

async function gencmd() {
    // HTMLから 画像アドレス を取得
    let address = document.getElementById("address").value;

    // もし URL の長さが 30 より大きい場合
    if (address.length > 30) {
        // 短縮URL を取得して address に代入する
        address = await getShortURL(address);
    }

    //---------- HTMLから値を取得 ---------- start
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;
    const x = document.getElementById("x").value;
    const y = document.getElementById("y").value;
    const z = document.getElementById("z").value;
    const rx = document.getElementById("rx").value;
    const ry = document.getElementById("ry").value;
    const rz = document.getElementById("rz").value;
    //---------- HTMLから値を取得 ---------- end

    // 看板に書かれる文字を生成して "signText" に代入
    const signText = createSignText(address, width, height, x, y, z, rx, ry, rz);

    // giveコマンドを生成
    const command = toCommand(signText, version);

    // HTMLに 生成した give コマンドを表示
    document.getElementById("generate").value = command;

    // 自動コピー
    if (document.getElementById("autocopy").checked) {
        navigator.clipboard.writeText(command);
    }
}

// html の body が読み込まれたら実行される関数
function load() {
    const versionText = version === "1.19" ? "1.19までモード" : version === "1.20" ? "1.20モード" : "1.21モード";
    document.getElementById("ver").insertAdjacentHTML('beforeend', `<p>${versionText}</p>`);
}

// アップロードする画像ファイルが選択されたら
async function onFile(input) {
    // 画像ファイルを取得
    const file = input.files[0];
    // アップロードして画像のURLを取得
    const url = await uploadFile(file);
    // 画像アドレスのテキストボックスに画像のURLを入力
    document.getElementById("address").value = url;
}
