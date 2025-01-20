// Get リクエスト
// json を return する
function get(url) {
    return new Promise((resolve) => {
        fetch(url)
            .then((res) => res.json())
            .then((json) => resolve(json))
            .catch(() => resolve(undefined));
    });
}

// Post リクエスト
// json を return する
function post(url, formData) {
    return new Promise((resolve) => {
        fetch(url, {
            method: "POST",
            body: formData
        })
            .then((res) => res.json())
            .then((json) => resolve(json))
            .catch(() => resolve(undefined));
    });
}

// アドレス、大きさ、位置、回転 のデータから
// 看板に書かれる文字を生成して
// それを return する
function createSignText(url, width, height, x, y, z, rx, ry, rz) {
    const texts = [url, x, y, z, height, width, rx, ry, rz];
    return texts.join("|");
}

// giveコマンドに変換して
// それを return する
function toCommand(signText, version) {
    const maxLength = 15;

    // 看板に表示するテキストを分割
    let texts = [];
    for (let i = 0; i < signText.length; i += maxLength) {
        texts.push(signText.substr(i, maxLength));
    }

    if (version === "1.19") {
        // 1.19用コマンド
        texts = texts.map((text, index) => `Text${index + 1}:'{"text":"${text}"}'`);
        return `/give @p minecraft:oak_sign{BlockEntityTag:{${texts.join(",")}}}`;
    } else if (version == "1.20") {
        texts = texts.map((text) => `'["${text}"]'`);
        if (texts.length <= 4) {
            let front_texts = texts.concat(Array(4).fill(`'[""]'`)).slice(0, 4);
            return `/give @p minecraft:oak_sign{BlockEntityTag:{front_text:{messages:[${front_texts}]}}}`;
        } else {
            let front_texts = texts.concat(Array(4).fill(`'[""]'`)).slice(0, 4);
            let back_texts = texts.concat(Array(8).fill(`'[""]'`)).slice(4, 8);
            return `/give @p minecraft:oak_sign{BlockEntityTag:{front_text:{messages:[${front_texts}]},back_text:{messages:[${back_texts}]}}}`;
        }
    } else {
        // 1.21用コマンド
        texts = texts.map((text) => `'["${text}"]'`);
        const messages = texts.concat(Array(4).fill(`'[""]'`)).slice(0, 4);
        return `/give @a oak_sign[block_entity_data={id:sign,front_text:{messages:[${messages.join(",")}]}}]`;
    }
}


async function getShortURL(url) {
    let shorturl = localStorage.getItem(url);

    // ローカルストレージに短縮したURLがキャッシュされていたら
    // それを return する
    if (shorturl) return shorturl;

    // https://is.gd/ の URL短縮APIを利用して 短縮URLを生成
    const json = await get(
        `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`
    );
    // 送られてきた json に shorturl があるかどうか チェック

    // shorturl の値を置き換える
    shorturl = json.shorturl;

    if (shorturl) {
        //もし あったら

        // ローカルストレージを利用して 短縮したURLをキャッシュ
        localStorage.setItem(url, shorturl);

        // ログを送信
        console.log(`URLを短縮しました: ${url} -> ${shorturl}`);
        return shorturl;
    } else {
        //もし なかったら
        //エラーのログを送信
        console.error("URLを短縮できませんでした");
        return url;
    }
}

// ファイルをアップロードする関数
async function uploadFile(file) {
    const url = "https://hm-nrm.h3z.jp/uploader/work.php"; // アップロード先のURL
    const formData = new FormData();
    formData.append("files", file);
    const json = await post(url, formData);
    if (json == undefined) return "アップロードに失敗しました";
    else if (json.files[0].error != undefined) return json.files[0].error;
    return json.files[0].url;
}
