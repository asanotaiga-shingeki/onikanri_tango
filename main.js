/**
 * 単語データの取得と整形
 * JSONキー: f=front, b=back, n=number/id
 */
async function getQuestions({ subject, start, end, num, reverse }) {
    try {
        const res = await fetch(`./${subject}.json`);
        if (!res.ok) throw new Error("Load failed");
        const data = await res.json();

        // 範囲フィルタリング
        // 歴史系はIDが文字列("1-1"等)の場合があるので、数値変換できる場合のみ範囲チェックを行う簡易ロジック
        let items = data.filter(item => {
            // n があればそれを使う、なければ number (互換性のため)
            const id = item.n !== undefined ? item.n : item.number;
            
            // 数値IDなら範囲チェック
            if (typeof id === 'number') {
                return id >= start && id <= end;
            }
            // 文字列IDならそのまま通す（歴史系など）
            return true;
        });

        // シャッフル
        for (let i = items.length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [items[i], items[r]] = [items[r], items[i]];
        }

        // 指定数に切り詰め & 整形
        return items.slice(0, num).map(item => {
            // 軽量化後のキー(f, b)と旧キー(frontText, backText)の両対応
            let front = item.f || item.frontText;
            let back = item.b || item.backText;
            const id = item.n || item.numberText || item.number;

            // 裏面に番号を付加
            if (id) back = `[${id}]\n${back}`;

            return {
                f: reverse ? back : front,
                b: reverse ? front : back
            };
        });

    } catch (e) {
        console.error(e);
        return [{ f: "Error", b: "データの読み込みに失敗しました" }];
    }
}
