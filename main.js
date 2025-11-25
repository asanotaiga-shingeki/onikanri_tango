// データをメモリに保存しておくキャッシュ
const bookDataCache = {};

/**
 * JSONデータを取得する関数（キャッシュ対応）
 * 初回のみ通信し、2回目以降はメモリから返します。
 */
async function fetchBookData(subject) {
    // すでにキャッシュにあればそれを返す
    if (bookDataCache[subject]) {
        return bookDataCache[subject];
    }

    try {
        const res = await fetch(`./jsons/${subject}.json`); // フォルダ構成に合わせてパスは調整してください
        if (!res.ok) throw new Error("Load failed");
        const data = await res.json();
        
        // キャッシュに保存
        bookDataCache[subject] = data;
        return data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * 取得済みのデータから、条件に合わせて問題をランダムに抽出する関数
 * 通信は行わず、一瞬で処理が終わります。
 */
function generateSet(data, { subject, start, end, num, reverse }) {
    if (!data) return [{ f: "Error", b: "データの読み込みに失敗しました" }];

    const archiveKey = "ARCHIVE_" + subject;
    const archivedIds = (localStorage.getItem(archiveKey) || "").split(",");

    // 範囲フィルタとアーカイブ除外
    let items = data.filter(item => {
        const id = item.n !== undefined ? item.n : item.number;
        const idStr = String(item.n || item.numberText || item.number || "");

        // アーカイブ済みなら除外
        if (archivedIds.includes(idStr)) return false;

        // 数値IDなら範囲チェック
        if (typeof id === 'number') {
            return id >= start && id <= end;
        }
        return true;
    });

    // シャッフル (Fisher-Yates)
    for (let i = items.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        [items[i], items[r]] = [items[r], items[i]];
    }

    // 指定数に切り詰め & 整形
    return items.slice(0, num).map(item => {
        let front = item.f || item.frontText;
        let back = item.b || item.backText;
        const id = item.n || item.numberText || item.number;

        if (id) back = `[${id}]\n${back}`;

        return {
            id: id,
            f: reverse ? back : front,
            b: reverse ? front : back
        };
    });
}
