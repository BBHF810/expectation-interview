import React from "react";

// 子ども向けによく使われる漢字とふりがなの辞書
const COMMON_KANJI_FURIGANA: Array<{ kanji: string; ruby: string }> = [
  { kanji: "お友だち", ruby: "お<ruby>友<rt>とも</rt></ruby>だち" },
  { kanji: "友だち", ruby: "<ruby>友<rt>とも</rt></ruby>だち" },
  { kanji: "お友達", ruby: "お<ruby>友<rt>とも</rt></ruby>だち" },
  { kanji: "友達", ruby: "<ruby>友<rt>とも</rt></ruby>だち" },
  { kanji: "家族", ruby: "<ruby>家族<rt>かぞく</rt></ruby>" },
  { kanji: "かぞく", ruby: "かぞく" },
  { kanji: "相手", ruby: "<ruby>相手<rt>あいて</rt></ruby>" },
  { kanji: "あいて", ruby: "あいて" },
  { kanji: "質問", ruby: "<ruby>質問<rt>しつもん</rt></ruby>" },
  { kanji: "気持ち", ruby: "<ruby>気持<rt>きも</rt></ruby>ち" },
  { kanji: "嬉しかった", ruby: "<ruby>嬉<rt>うれ</rt></ruby>しかった" },
  { kanji: "嬉しい", ruby: "<ruby>嬉<rt>うれ</rt></ruby>しい" },
  { kanji: "教えて", ruby: "<ruby>教<rt>おし</rt></ruby>えて" },
  { kanji: "言葉", ruby: "<ruby>言葉<rt>ことば</rt></ruby>" },
  { kanji: "大切", ruby: "<ruby>大切<rt>たいせつ</rt></ruby>" },
  { kanji: "自分", ruby: "<ruby>自分<rt>じぶん</rt></ruby>" },
  { kanji: "時間", ruby: "<ruby>時間<rt>じかん</rt></ruby>" },
  { kanji: "笑顔", ruby: "<ruby>笑顔<rt>えがお</rt></ruby>" },
  { kanji: "出来事", ruby: "こと" }, // 出来事は「こと」に自動置換
];

/**
 * 読み上げTTS用にカッコ付きふりがなやルビタグを除去してプレーンな発話用テキストにする
 */
export function stripFurigana(text: string): string {
  if (!text) return "";
  // <ruby>漢字<rt>かんじ</rt></ruby> -> 漢字
  let clean = text.replace(/<ruby>([^<]+)<rt>[^<]*<\/rt><\/ruby>/g, "$1");
  // （かんじ） や (かんじ) などのふりがなカッコ書きを除去
  clean = clean.replace(/[（\(][ぁ-ん]+[）\)]/g, "");
  // 出来事 -> こと
  clean = clean.replace(/出来事/g, "こと");
  return clean;
}

interface FuriganaTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 子ども向けモードで漢字にふりがな（ルビ）をつけて表示するコンポーネント
 * 1. テキスト内に 漢字（かんじ） や 漢字(かんじ) があれば <ruby>漢字<rt>かんじ</rt></ruby> に変換
 * 2. 代表的な漢字（家族、友だち、相手等）にも自動でルビを付与
 * 3. 「出来事」は「こと」に自動置換
 */
export const FuriganaText: React.FC<FuriganaTextProps> = ({ text, className, style }) => {
  if (!text) return null;

  // まず出来事を「こと」に置換
  let html = text.replace(/出来事/g, "こと");

  // 1. 漢字＋送り仮名（ひらがな） のパターンを <ruby>単語<rt>ひらがな</rt></ruby> に変換
  html = html.replace(/([一-龠々][一-龠々ぁ-ん]*)[（\(]([ぁ-ん]+)[）\)]/g, "<ruby>$1<rt>$2</rt></ruby>");

  // 2. 辞書に基づく代表的漢字へのルビ付与（既にrubyタグ化されていない部分のみ）
  for (const { kanji, ruby } of COMMON_KANJI_FURIGANA) {
    if (kanji === "出来事") continue;
    // <ruby>の内側にはマッチさせないための簡易チェック
    const regex = new RegExp(`(?<!<ruby>[^<]*)${kanji}(?![^<]*<\\/ruby>)`, "g");
    html = html.replace(regex, ruby);
  }

  return (
    <span
      className={className}
      style={{ ...style, lineHeight: "1.9" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
