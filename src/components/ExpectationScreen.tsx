import React, { useState } from "react";
import { ExpectationType } from "@/types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface ExpectationScreenProps {
  onSelect: (exp: ExpectationType) => void;
  onBack: () => void;
  isSimple?: boolean;
}

export const ExpectationScreen: React.FC<ExpectationScreenProps> = ({
  onSelect,
  onBack,
  isSimple = false,
}) => {
  const [selected, setSelected] = useState<ExpectationType | null>(null);

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 className="title" style={{ textAlign: "center" }}>
        {isSimple ? (
          "さいきんあったことについて"
        ) : (
          "身近な人との最近の出来事について"
        )}
      </h2>

      <p className="subtitle" style={{ textAlign: "center", lineHeight: 1.6 }}>
        {isSimple ? (
          <>
            お友だちやかぞくと遊んだこと、お話ししたことなど、心にのこっていることを1つ思い浮かべてみてね。
            <br />
            <strong>そのとき、お互いのきもちはどうだったかな？</strong>
          </>
        ) : (
          <>
            一緒に出かけたこと、手伝ってもらったこと、連絡のやりとりなど、身近な人（友だち・家族・恋人など）との出来事を1つ思い浮かべてみてください。
            <br />
            <strong>そのとき、お互いの期待や気持ちは近かったですか？</strong>
          </>
        )}
      </p>

      {/* 具体例カード */}
      <div
        style={{
          background: "var(--color-surface-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          margin: "1rem 0 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          border: "1px solid var(--color-border)",
        }}
      >
        <div style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
          💡 <strong>{isSimple ? "ぴったり合っていたこと" : "ぴったり合っていた例"}</strong>：
          <br />
          <span style={{ color: "var(--color-text-muted)" }}>
            {isSimple
              ? "「あそびたいとおもっていたら、お友だちもいっしょにあそぼうとさそってくれた」"
              : "「ここに行きたいなと思っていたら、相手も同じ場所を提案してくれた」"}
          </span>
        </div>
        <div style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
          💡 <strong>{isSimple ? "すれちがっちゃったこと" : "すれちがった例"}</strong>：
          <br />
          <span style={{ color: "var(--color-text-muted)" }}>
            {isSimple
              ? "「こうしてほしいなとおもっていたけれど、あいてにはつたわっていなかった」"
              : "「こうしてくれるかなと期待していたけれど、相手には伝わっていなかった」"}
          </span>
        </div>
      </div>

      <div className="option-grid">
        <button
          type="button"
          onClick={() => setSelected("matched")}
          className={`option-card ${selected === "matched" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>
              {isSimple ? "ぴったり合っていた（うれしかった）" : "ぴったり合っていた（期待どおり・嬉しかった）"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
              {isSimple ? "おもったとおり、きもちが通じ合った" : "相手の言葉や対応が嬉しかった出来事"}
            </div>
          </div>
          {selected === "matched" && <Check size={22} color="var(--color-primary)" />}
        </button>

        <button
          type="button"
          onClick={() => setSelected("mismatched")}
          className={`option-card ${selected === "mismatched" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>
              {isSimple ? "少しすれちがった（あれ？とおもった）" : "少しすれちがった（思い通りにならなかった）"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
              {isSimple ? "ほんとうはこうしてほしかったこと" : "思っていたのと違ってモヤッとした出来事"}
            </div>
          </div>
          {selected === "mismatched" && <Check size={22} color="var(--color-primary)" />}
        </button>

        <button
          type="button"
          onClick={() => setSelected("neutral")}
          className={`option-card ${selected === "neutral" ? "selected" : ""}`}
          style={{ justifyContent: "space-between" }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>
              {isSimple ? "どちらともいえない・りょうほうあった" : "どちらともいえない・両方あった"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
              {isSimple ? "よかったところも、ちがったところもある" : "うまくいった面と違った面の両方があった"}
            </div>
          </div>
          {selected === "neutral" && <Check size={22} color="var(--color-primary)" />}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1.75rem" }}>
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={20} />
          もどる
        </button>

        <button
          type="button"
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="btn btn-primary"
          style={{ minWidth: "160px" }}
        >
          次へ
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
