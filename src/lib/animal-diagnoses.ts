import { AnimalDiagnosis, PairAnimalDiagnosis } from "@/types";

/**
 * シングル用固定動物タイプの定義
 */
export interface SingleAnimalMaster {
  id: string;
  animalEmoji: string;
  animalName: string;
  shortName: string;
  catchphrase: string;
  academicTrait: string;
  defaultDescription: string;
  futureTrait: string;
  /** 判定の根拠・特徴（どんなコミュニケーション特性や期待を持つ人が該当するか） */
  criteria: string;
  /** 具体例（典型的なエピソードや発言例） */
  concreteExamples: string[];
}

/**
 * ペア用固定動物タイプの定義
 */
export interface PairAnimalMaster {
  id: string;
  animalA: { emoji: string; name: string };
  animalB: { emoji: string; name: string };
  pairTitle: string;
  pairCatchphrase: string;
  academicDynamic: string;
  defaultDescription: string;
  futureRelationship: string;
  /** 判定の根拠・特徴 */
  criteria: string;
  /** 具体例（典型的なエピソードや発言例） */
  concreteExamples: string[];
}

/**
 * シングル用 固定動物タイプマスター（全14種）
 */
export const SINGLE_ANIMAL_MASTERS: SingleAnimalMaster[] = [
  {
    id: "dog",
    animalEmoji: "🐶",
    animalName: "素直なワンちゃんタイプ",
    shortName: "ワンちゃん",
    catchphrase: "まっすぐな信頼とピュアな心",
    academicTrait: "高親和・ストレート表出型（Direct & Affiliative）",
    defaultDescription:
      "相手への期待を大切にして、素直な気持ちで向き合えるタイプです。お互いの思いを言葉にし合うことで、さらに強い絆が育まれます。",
    futureTrait: "感情の透明性が高く、周囲に安心感と活気をもたらすオープンマインドな性格",
    criteria:
      "相手への好意や期待を率直にストレートに表現したい傾向。嘘や駆け引きを好まず、思ったことを素直に伝え合ってまっすぐ向き合いたいと望む。",
    concreteExamples: [
      "「LINEが来たらすぐ返信してほしいし、自分も早く話したかった」",
      "「プレゼントを渡した時、その場で喜ぶ顔が見たくてワクワクしていた」",
      "「困ったときは遠慮せず、お互いに『助けて』と言い合える関係でいたい」",
    ],
  },
  {
    id: "cat",
    animalEmoji: "🐱",
    animalName: "マイペースな猫ちゃんタイプ",
    shortName: "猫ちゃん",
    catchphrase: "心地よい距離感と自立した優しさ",
    academicTrait: "自立志向・適応的距離感型（Autonomous & Adaptive）",
    defaultDescription:
      "相手の領域も自分のペースも尊重できるタイプです。すれ違いが起きても『そういうこともあるよね』とお互いの違いを認め合えるしなやかさがあります。",
    futureTrait: "お互いの境界線を尊重し、過度な干渉を避けてしなやかに共存できる自立した性格",
    criteria:
      "お互いの自由やパーソナルスペースを最重視する傾向。過度な束縛や干渉を避け、違いを認め合いながら無理のない距離感で付き合いたいと望む。",
    concreteExamples: [
      "「休日は予定を詰め込まず、お互いそれぞれのペースで過ごしたかった」",
      "「連絡の頻度に縛られず、返信したい時に返すのが一番楽」",
      "「意見が食い違っても『そういう考えもあるよね』と自然に流せる」",
    ],
  },
  {
    id: "owl",
    animalEmoji: "🦉",
    animalName: "見守りフクロウタイプ",
    shortName: "フクロウ",
    catchphrase: "深い洞察力と静かな包容力",
    academicTrait: "内省的・観察受容型（Reflective & Accommodating）",
    defaultDescription:
      "相手の状況や気持ちを一歩引いて客観的に見つめられるタイプです。言葉にしない期待の奥にある想いに気づく優しさを持っています。",
    futureTrait: "相手のサインを静かに察知し、必要なときに適切なサポートを届けられる思慮深い性格",
    criteria:
      "一歩引いて状況や相手の心理を客観的・論理的に観察・分析する傾向。感情的にならず、理由や本質的な納得感を大切にして冷静に対処したいと望む。",
    concreteExamples: [
      "「なぜそうしたのか、相手の理由や意図を落ち着いて聞いて整理したかった」",
      "「相手が悩んでいるサインに気づいていたが、本人が話し出すまで静かに待った」",
      "「事前の段取りや前提をしっかりお互いにすり合わせておきたかった」",
    ],
  },
  {
    id: "dolphin",
    animalEmoji: "🐬",
    animalName: "共感イルカタイプ",
    shortName: "イルカ",
    catchphrase: "気持ちのキャッチボールを楽しむ共感力",
    academicTrait: "共感主導・相互同調型（Empathetic & Synchronous）",
    defaultDescription:
      "心と心が通じ合う温かい瞬間を何よりも愛するタイプです。楽しいこともすれ違いも、お互いを深く知るきっかけに変えていけます。",
    futureTrait: "気持ちの波長を敏感に受け止め、ポジティブな感情を分かち合えるムードメーカーな性格",
    criteria:
      "感情の波長や気持ちのキャッチボール、共感と感情の一致を何よりも大切にする傾向。嬉しいことも辛いことも一緒に共有し合いたいと望む。",
    concreteExamples: [
      "「『美味しかったね』『楽しかったね』と同じ気持ちを分かち合いたかった」",
      "「落ち込んでいるときに、アドバイスよりもまず『大変だったね』と共感してほしかった」",
      "「嬉しいことがあった瞬間、誰よりも早くその人に報告したくなった」",
    ],
  },
  {
    id: "bear",
    animalEmoji: "🐻",
    animalName: "ぬくもりクマさんタイプ",
    shortName: "クマさん",
    catchphrase: "どっしり構える安心感と大きな思いやり",
    academicTrait: "安定志向・情動的包容型（Secure & Supportive）",
    defaultDescription:
      "相手のどんな一面も大らかに受け止めようとする包容力タイプです。そばにいるだけで相手にホッとした安心感を届けられます。",
    futureTrait: "相手の感情の揺らぎをどっしりと受け止め、居場所としての絶対的な安心感を与える性格",
    criteria:
      "相手の感情の揺らぎやミスも大らかに受け止める安心感を提供する傾向。居場所としての温かさや、無条件の受け止めを重視する。",
    concreteExamples: [
      "「相手が疲れているときは、無理に話させず静かに休ませてあげたかった」",
      "「ミスや失敗があっても責めずに『大丈夫だよ、何とかなるよ』と包み込みたい」",
      "「特別なことをしなくても、ただそばにいるだけで安心できる存在でいたい」",
    ],
  },
  {
    id: "penguin",
    animalEmoji: "🐧",
    animalName: "よりそいペンギンタイプ",
    shortName: "ペンギン",
    catchphrase: "力を合わせて歩む健気なチームワーク",
    academicTrait: "協調行動・タスク共有型（Collaborative & Cooperative）",
    defaultDescription:
      "相手と一緒に同じ方向を向いて協力し合いたいと願う誠実なタイプです。小さなすれ違いも、ふたりの歩幅を合わせるための大切な一歩になります。",
    futureTrait: "目標や暮らしの課題を一緒に分担し、歩幅を合わせて前進できるチームワーク志向の性格",
    criteria:
      "同じ目標や日常の課題を一緒に分担し、歩幅を合わせて協力・前進したい傾向。どちらか一方に偏らない対等なパートナーシップを重視する。",
    concreteExamples: [
      "「旅行の計画や準備を、一方任せにせず一緒に相談して分担したかった」",
      "「日々の困りごとをふたりで話し合いながら、チームのように解決したい」",
      "「相手が頑張っているときは、自分も同じくらいサポートして力になりたい」",
    ],
  },
  {
    id: "squirrel",
    animalEmoji: "🐿️",
    animalName: "きくばりリスさんタイプ",
    shortName: "リスさん",
    catchphrase: "細やかな気配りと先回りの優しさ",
    academicTrait: "配慮主導・予防的サポート型（Attentive & Proactive）",
    defaultDescription:
      "相手が困らないように先回りして準備したり、小さな変化にすぐ気づける気配り上手です。さりげない心遣いで周りを心地よく満たします。",
    futureTrait: "日常の些細なサインやニーズを敏感にキャッチし、円滑で心地よい環境を整える性格",
    criteria:
      "相手が困らないよう先回りして準備や配慮をする傾向。日常の小さな変化や相手のニーズにいち早く気づき、心地よい環境を整えたいと望む。",
    concreteExamples: [
      "「相手が疲れている様子を見て、言われる前に温かい飲み物を用意しておいた」",
      "「出かける前に電車の時間や道順を事前に調べておいてあげた」",
      "「相手が話しにくそうにしているのを察して、さりげなく水を向けた」",
    ],
  },
  {
    id: "fox",
    animalEmoji: "🦊",
    animalName: "ひらめきキツネタイプ",
    shortName: "キツネ",
    catchphrase: "スマートな機転としなやかな適応力",
    academicTrait: "認知的柔軟性・状況適応型（Flexible & Resourceful）",
    defaultDescription:
      "予想外のすれ違いが起きても、機転を利かせて柔軟に別の楽しさを見つけられるタイプです。どんな状況も軽やかに乗りこなす柔軟性を持っています。",
    futureTrait: "想定外の状況でも慌てず、新しい解決策や楽しい視点に素早く切り替えられる性格",
    criteria:
      "予定変更やすれ違いが起きても、機転を利かせて臨機応変に新しい解決策や楽しみを見出す傾向。状況へのしなやかな適応力を誇る。",
    concreteExamples: [
      "「行こうとしていたお店が休みだったが、近くの面白そうな店を探して楽しめた」",
      "「すれ違って気まずくなったけれど、別の話題を振って上手に空気を切り替えた」",
      "「思い通りにいかなくても『これはこれで面白いかも』と発想を転換できる」",
    ],
  },
  {
    id: "hedgehog",
    animalEmoji: "🦔",
    animalName: "シャイなハリネズミタイプ",
    shortName: "ハリネズミ",
    catchphrase: "不器用だけど純粋で深いあたたかさ",
    academicTrait: "防衛受容・深層愛着型（Cautious & Dedicated）",
    defaultDescription:
      "最初は少し慎重で気持ちを出すのに時間がかかりますが、心の中には相手への純粋で温かい想いが詰まっているタイプです。時間をかけて確かな絆を育みます。",
    futureTrait: "慎重に信頼関係を深め、一度築いた絆を何よりも大切に守り抜く誠実な性格",
    criteria:
      "慎重さや照れがあり本音を出すのに時間はかかるが、内面には強い誠実さと深い愛情を秘めている傾向。相手を傷つけたくない優しさを持つ。",
    concreteExamples: [
      "「本当は言いたいことがあったけれど、相手を困らせたくなくて言葉を飲み込んだ」",
      "「相手の反応が気になってしまい、自分から誘うのに少し勇気が必要だった」",
      "「時間をかけて打ち解けた相手とは、誰よりも深くて強い信頼で結ばれる」",
    ],
  },
  {
    id: "sea_otter",
    animalEmoji: "🦦",
    animalName: "陽気なラッコタイプ",
    shortName: "ラッコ",
    catchphrase: "笑顔とユーモアでほぐすポジティブな心",
    academicTrait: "情動調整・ユーモア媒介型（Playful & Harmonizing）",
    defaultDescription:
      "ちょっとしたすれ違いやモヤモヤも、笑顔やユーモアでふわりと和らげてしまえるタイプです。一緒にいる空間を明るい空気で満たします。",
    futureTrait: "張り詰めた空気をポジティブにほぐし、人との関わりを楽しい遊び場に変える性格",
    criteria:
      "ユーモアや笑顔、明るさですれ違いや気まずい空気を和らげる傾向。深刻になりすぎず、笑い合える楽しい空間づくりを大切にする。",
    concreteExamples: [
      "「気まずい空気になりそうな時、あえて冗談を言ってふたりで大笑いした」",
      "「些細な失敗やすれ違いも『やっちゃったね！』と明るく笑い飛ばしたい」",
      "「一緒にいる時は何気ないことでも楽しく笑い合える関係でいたい」",
    ],
  },
  {
    id: "deer",
    animalEmoji: "🦌",
    animalName: "おだやかシカタイプ",
    shortName: "シカ",
    catchphrase: "相手を尊重する静かな調和と品性",
    academicTrait: "非侵襲・調和維持型（Non-intrusive & Peaceful）",
    defaultDescription:
      "相手の領域や気持ちに無理に踏み込まず、自然な距離感を大切にしながらそっと寄り添えるタイプです。穏やかで安心できる関係を作ります。",
    futureTrait: "相手のペースとプライベートを大切に尊重し、長続きする穏やかな調和を保つ性格",
    criteria:
      "相手の領域や境界線に踏み込みすぎず、自然で礼儀正しい距離感を保ちながら優しく寄り添う傾向。波風を立てず穏やかな調和を大切にする。",
    concreteExamples: [
      "「相手のプライベートな時間や予定を一番に尊重して見守りたかった」",
      "「感情的にぶつかるのではなく、お互い穏やかなトーンで話し合いたい」",
      "「無理に踏み込まず、相手が必要としてくれたときにそっと寄り添いたい」",
    ],
  },
  {
    id: "lion",
    animalEmoji: "🦁",
    animalName: "頼れるライオンタイプ",
    shortName: "ライオン",
    catchphrase: "力強い情熱とブレない包容リーダーシップ",
    academicTrait: "能動主導・防護的コミットメント型（Assertive & Protective）",
    defaultDescription:
      "相手を喜ばせたい、困ったときは守りたいという強い情熱とリーダーシップを持つタイプです。頼もしさで相手に前向きな勇気を届けます。",
    futureTrait: "決断力と責任感を持ち、大切な人を力強く引っ張りながら安心をもたらす性格",
    criteria:
      "自分がリードして相手を守りたい、喜ばせたいという強い責任感とリーダーシップを持つ傾向。頼りにされることで力を発揮し、前向きに牽引する。",
    concreteExamples: [
      "「相手が困っている場面を見て、自分が前に出て解決してあげたかった」",
      "「ふたりの予定やお出かけを自分がしっかりリードして楽しませたかった」",
      "「頼りにされると嬉しくなり、もっと力になりたいと熱い想いが湧く」",
    ],
  },
  {
    id: "elephant",
    animalEmoji: "🐘",
    animalName: "しっかりゾウさんタイプ",
    shortName: "ゾウさん",
    catchphrase: "約束を重んじる揺るぎない信頼と誠実さ",
    academicTrait: "信義誠実・長期継続型（Consistent & Loyal）",
    defaultDescription:
      "過去の約束やふたりで交わした言葉を大切に記憶し、相手に誠実に応え続けようとするタイプです。揺るぎない安心感で周囲を支えます。",
    futureTrait: "約束や信頼を何よりも重んじ、時間をかけて揺るぎない安心と実績を積み重ねる性格",
    criteria:
      "約束や過去の言葉、積み重ねてきた信頼関係を最重要視する傾向。ブレない誠実さと一貫性を持ち、長期的な絆を大切に育みたいと望む。",
    concreteExamples: [
      "「以前に約束したことや交わした言葉をしっかり覚えていて守ってほしかった」",
      "「時間が経っても変わらない安定した信頼関係をコツコツ築きたい」",
      "「嘘やいい加減な態度を嫌い、誠実でまっすぐなやり取りを続けたい」",
    ],
  },
  {
    id: "rabbit",
    animalEmoji: "🐇",
    animalName: "びかんウサギタイプ",
    shortName: "ウサギ",
    catchphrase: "豊かな感受性と素早い思いやりのアンテナ",
    academicTrait: "高感受性・迅速応答型（Sensitive & Responsive）",
    defaultDescription:
      "相手の些細な表情や声のトーンの変化を素早く感じ取り、ピュアな優しさで応答できるタイプです。繊細だからこそ、相手の痛みに一番に寄り添えます。",
    futureTrait: "細やかな心の機微を察知し、相手の気持ちに優しく共鳴できる高い感受性を持つ性格",
    criteria:
      "相手の些細な表情、言葉のニュアンス、声のトーンに敏感に反応し、痛みや変化に素早く共鳴する傾向。繊細な優しさと思いやりを重んじる。",
    concreteExamples: [
      "「ちょっとした一言や声のトーンの変化にすぐ気づいて心配になった」",
      "「相手が少し無理をして笑っているのを見て、胸がキュッとなった」",
      "「お互いに傷つけ合わないよう、細やかな言葉遣いや気配りを大切にしたい」",
    ],
  },
];

/**
 * ペア用 固定動物タイプマスター（全8種）
 */
export const PAIR_ANIMAL_MASTERS: PairAnimalMaster[] = [
  {
    id: "dog_cat",
    animalA: { emoji: "🐶", name: "素直なワンちゃん" },
    animalB: { emoji: "🐱", name: "マイペースな猫ちゃん" },
    pairTitle: "お互いを引き立て合うナイスペア",
    pairCatchphrase: "正反対のテンポが心地よい絶妙なバランス",
    academicDynamic: "相補的適応型（Complementary Adaptation: 能動表出 × 自律受容）",
    defaultDescription:
      "素直に思いを伝える側と、マイペースに受け止める側で、お互いの違いを自然に楽しめている素敵なふたりです。すれ違いがあっても『まあいっか』と笑い合える軽やかさがあります。",
    futureRelationship: "違いを楽しみながらお互いの自由を尊重し合う『自律共創パートナー』",
    criteria:
      "一方が素直に気持ちを伝え、もう一方がマイペースに受け止める相補的関係。テンポや表現の違いをストレスではなく面白さとして認め合える。",
    concreteExamples: [
      "片方がLINEを頻繁に送り、もう片方がマイペースに返すが、お互いそれを理解し合っている関係",
      "片方が熱心に提案し、もう片方が『いいね〜』と気負わず付き合う凸凹バランス",
    ],
  },
  {
    id: "dolphin_dolphin",
    animalA: { emoji: "🐬", name: "共感イルカ" },
    animalB: { emoji: "🐬", name: "共感イルカ" },
    pairTitle: "息ぴったり！波長が合う共感コンビ",
    pairCatchphrase: "言葉にしなくても通じ合える仲良しペア",
    academicDynamic: "相互同調型（Mutual Synchrony: 高共感・即時フィードバック）",
    defaultDescription:
      "お互いの楽しい気持ちや嬉しい瞬間を共有し合える、とても温かい関係性です。お互いの感情のキャッチボールが自然に弾んでいます。",
    futureRelationship: "感情の波長がシンクロし、喜びも悩みも瞬時に分かち合える『共鳴ソウルメイト』",
    criteria:
      "お互いに感情の共鳴やリアクションを大切にし、同じテンションで喜びや感動を分かち合える相互同調の関係。",
    concreteExamples: [
      "同じ映画や出来事を見て同じ場所で笑ったり涙ぐんだりして、すぐに語り合える関係",
      "嬉しかった出来事をお互いに競うように報告し合える関係",
    ],
  },
  {
    id: "dog_owl",
    animalA: { emoji: "🐶", name: "素直なワンちゃん" },
    animalB: { emoji: "🦉", name: "見守りフクロウ" },
    pairTitle: "頼もしい安心感！見守り＆素直ペア",
    pairCatchphrase: "深い信頼と安心感で結ばれたふたり",
    academicDynamic: "安定補完型（Secure Complementary: 直面行動 × 俯瞰的認知的支援）",
    defaultDescription:
      "一歩引いて静かに見守る側と、まっすぐに気持ちをぶつける側で、お互いに深い安心感を持っています。困ったときも助け合える心強いパートナーシップです。",
    futureRelationship: "動く人と見守る人が自然に噛み合い、どんな変化も乗り越えられる『信頼の航海パートナー』",
    criteria:
      "感情豊かに行動・表出する側と、冷静に状況を見守り客観的な支えとなる側の組み合わせ。深い安心感と相互補完が生まれる。",
    concreteExamples: [
      "一方がパッとやってみたいことを言い出し、もう一方が冷静に段取りを整えて支えてくれる関係",
      "困った時に相談すると、感情的にならず的確なアドバイスと安心感をくれる関係",
    ],
  },
  {
    id: "bear_penguin",
    animalA: { emoji: "🐻", name: "ぬくもりクマさん" },
    animalB: { emoji: "🐧", name: "よりそいペンギン" },
    pairTitle: "ほのぼの温かい！よりそい安心チーム",
    pairCatchphrase: "一緒にいるだけでホッとする優しい時間",
    academicDynamic: "協調支援型（Collaborative Supportive: 相互ケア・協同行動）",
    defaultDescription:
      "お互いに気遣い合い、相手を尊重する思いやりに溢れています。小さな日常の出来事も、ふたりにとってはかけがえのない大切な思い出になります。",
    futureRelationship: "日々の暮らしのタスクや安心感を分け合い、穏やかな日常を紡ぎ続ける『ひだまり共生チーム』",
    criteria:
      "大らかな包容力と協調的な支え合いが合わさり、日々の生活や日常を思いやりを持って穏やかに紡いでいける関係。",
    concreteExamples: [
      "「今日もお疲れさま」と互いを労い、日々の役割や予定を穏やかに助け合いながら過ごす関係",
      "体調を崩した時に自然とお互いを看病し合えるような、温かなチームワーク",
    ],
  },
  {
    id: "squirrel_fox",
    animalA: { emoji: "🐿️", name: "きくばりリス" },
    animalB: { emoji: "🦊", name: "ひらめきキツネ" },
    pairTitle: "スマート連携！名探偵＆サポーターペア",
    pairCatchphrase: "先回りの気配りと機転の良さで息ぴったり",
    academicDynamic: "戦略的相補型（Strategic Complementarity: 予見的配慮 × 状況即応）",
    defaultDescription:
      "細かい部分によく気がつく気配りと、機転を利かせて状況を動かす柔軟さが合わさった、非常に有能でテンポの良いふたりです。どんな出来事も軽やかに楽しく解決できます。",
    futureRelationship: "困難な出来事もふたりの知恵と機転で軽やかに乗り越えていく『最強のタッグパートナー』",
    criteria:
      "先回りの細やかな気配りと、臨機応変な機転・柔軟性が組み合わさった機動的ペア。トラブルやすれ違いも軽やかに乗り切れる。",
    concreteExamples: [
      "旅行先で想定外のアクシデントが起きても、一方が事前に調べた情報ともう一方の機転で楽しく乗り切ったエピソード",
      "お互いの得意分野を活かして、スムーズに物事を進められる関係",
    ],
  },
  {
    id: "hedgehog_bear",
    animalA: { emoji: "🦔", name: "シャイなハリネズミ" },
    animalB: { emoji: "🐻", name: "ぬくもりクマさん" },
    pairTitle: "じんわり温まる！ゆっくり絆ペア",
    pairCatchphrase: "時間はかかっても絶対に壊れない深い信頼",
    academicDynamic: "保護的受容型（Protective Acceptance: 防衛的自己開示 × 感情的受容）",
    defaultDescription:
      "繊細で慎重な側を、どっしり構える側が優しく包み込み、ゆっくりと確かな安心感を育めるふたりです。一緒にいるほど心が安らぎ、本音を打ち明け合えます。",
    futureRelationship: "お互いの繊細さを守り合い、静かなぬくもりで寄り添い続ける『避難所のような安心パートナー』",
    criteria:
      "慎重で傷つきやすい側を、大らかな受け止め側が優しく包み込む関係。時間をかけて確固たる信頼と安心感が深まる。",
    concreteExamples: [
      "最初は遠慮がちだったが、相手がいつも変わらず温かく迎えてくれたことで心を開けた関係",
      "周囲には言えない本音や弱音も、ふたりの間では安心して話せる関係",
    ],
  },
  {
    id: "sea_otter_deer",
    animalA: { emoji: "🦦", name: "陽気なラッコ" },
    animalB: { emoji: "🦌", name: "おだやかシカ" },
    pairTitle: "笑顔と癒やし！ピースフルフレンズ",
    pairCatchphrase: "ユーモアと穏やかさが調和する心地よい空気",
    academicDynamic: "調和共生型（Harmonious Coexistence: ポジティブ感情喚起 × 非侵襲的受容）",
    defaultDescription:
      "楽しい話題で場を明るくする側と、穏やかに微笑んで見守る側で、いつも心地よい空気が流れています。お互いに無理をせず自然体でいられる関係です。",
    futureRelationship: "どんな変化も笑い飛ばしながら、お互いのプライベートを尊重し合える『陽だまりフレンド』",
    criteria:
      "ユーモアで場を明るく和ませる側と、穏やかな調和を保つ側のピースフルな関係。無理をせず自然体でいられる居心地の良さがある。",
    concreteExamples: [
      "些細なすれ違いやミスも笑いに変えて、お互いに気負わず自然体でいられる関係",
      "一緒にいると肩の力が抜けて、穏やかに笑い合える関係",
    ],
  },
  {
    id: "lion_dog",
    animalA: { emoji: "🦁", name: "頼れるライオン" },
    animalB: { emoji: "🐶", name: "素直なワンちゃん" },
    pairTitle: "熱血タッグ！前進するチャレンジペア",
    pairCatchphrase: "まっすぐな情熱と信頼で突き進むパワフルコンビ",
    academicDynamic: "目標志向・能動牽引型（Goal-oriented & Assertive: 能動的リード × 高協調）",
    defaultDescription:
      "力強くリードする側と、まっすぐ素直に応える側で、ポジティブなエネルギーに満ちた関係です。お互いを高め合い、背中を押し合える力強さがあります。",
    futureRelationship: "お互いの背中を押し合い、新しい目標や挑戦に立ち向かい続ける『情熱の前進パートナー』",
    criteria:
      "力強い情熱で引っ張る側と、まっすぐ素直に信頼して応える側のパワフルな関係。前向きな挑戦や成長を共に喜べる。",
    concreteExamples: [
      "新しい挑戦やイベントを一緒に企画し、熱量を持ってどんどん前に進めていく関係",
      "お互いのやる気を引き出し、背中を押し合える高め合いの関係",
    ],
  },
];

/**
 * プロンプト提示用: シングル固定動物タイプの選択肢テキスト
 */
export function getSingleAnimalPromptOptions(): string {
  return SINGLE_ANIMAL_MASTERS.map(
    (m, idx) =>
      `${idx + 1}. 【${m.animalName}】(${m.animalEmoji})
- キャッチコピー: ${m.catchphrase}
- 判定の根拠・特徴: ${m.criteria}`
  ).join("\n\n");
}

/**
 * プロンプト提示用: ペア固定動物タイプの選択肢テキスト
 */
export function getPairAnimalPromptOptions(): string {
  return PAIR_ANIMAL_MASTERS.map(
    (m, idx) =>
      `${idx + 1}. 【${m.pairTitle}】 (${m.animalA.name}${m.animalA.emoji} × ${m.animalB.name}${m.animalB.emoji})
- キャッチコピー: ${m.pairCatchphrase}
- 判定の根拠・特徴: ${m.criteria}`
  ).join("\n\n");
}

/**
 * 名前またはキーワードからシングル固定動物タイプを検索・正規化
 */
export function normalizeSingleAnimal(
  rawName: string | undefined,
  fallbackIndex = 0
): SingleAnimalMaster {
  if (!rawName) return SINGLE_ANIMAL_MASTERS[fallbackIndex] || SINGLE_ANIMAL_MASTERS[0];

  // 1. 完全一致
  const exact = SINGLE_ANIMAL_MASTERS.find(
    (m) => m.animalName === rawName || m.id === rawName
  );
  if (exact) return exact;

  // 2. 部分一致（動物名またはshortNameを含む）
  const partial = SINGLE_ANIMAL_MASTERS.find(
    (m) =>
      rawName.includes(m.shortName) ||
      rawName.includes(m.animalEmoji) ||
      m.animalName.includes(rawName)
  );
  if (partial) return partial;

  // 3. 主要動物キーワードによる名寄せ
  if (rawName.includes("犬") || rawName.includes("イヌ") || rawName.includes("ワン"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "dog")!;
  if (rawName.includes("猫") || rawName.includes("ネコ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "cat")!;
  if (rawName.includes("梟") || rawName.includes("フクロウ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "owl")!;
  if (rawName.includes("イルカ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "dolphin")!;
  if (rawName.includes("熊") || rawName.includes("クマ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "bear")!;
  if (rawName.includes("ペンギン"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "penguin")!;
  if (rawName.includes("栗鼠") || rawName.includes("リス"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "squirrel")!;
  if (rawName.includes("狐") || rawName.includes("キツネ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "fox")!;
  if (rawName.includes("ハリネズミ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "hedgehog")!;
  if (rawName.includes("ラッコ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "sea_otter")!;
  if (rawName.includes("鹿") || rawName.includes("シカ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "deer")!;
  if (rawName.includes("獅子") || rawName.includes("ライオン"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "lion")!;
  if (rawName.includes("象") || rawName.includes("ゾウ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "elephant")!;
  if (rawName.includes("兎") || rawName.includes("ウサギ"))
    return SINGLE_ANIMAL_MASTERS.find((m) => m.id === "rabbit")!;

  return SINGLE_ANIMAL_MASTERS[fallbackIndex] || SINGLE_ANIMAL_MASTERS[0];
}

/**
 * ペアタイトルまたはキーワードからペア固定動物タイプを検索・正規化
 */
export function normalizePairAnimal(
  rawTitle: string | undefined,
  fallbackIndex = 0
): PairAnimalMaster {
  if (!rawTitle) return PAIR_ANIMAL_MASTERS[fallbackIndex] || PAIR_ANIMAL_MASTERS[0];

  const exact = PAIR_ANIMAL_MASTERS.find(
    (m) => m.pairTitle === rawTitle || m.id === rawTitle
  );
  if (exact) return exact;

  const partial = PAIR_ANIMAL_MASTERS.find(
    (m) => rawTitle.includes(m.pairTitle) || m.pairTitle.includes(rawTitle)
  );
  if (partial) return partial;

  return PAIR_ANIMAL_MASTERS[fallbackIndex] || PAIR_ANIMAL_MASTERS[0];
}
