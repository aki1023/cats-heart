import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



app.post("/api/cat-comment", async (req, res) => {
  try {
    const {
      petName,
      petType,
      action,
      tail,
      ear,
      voice,
      eye
    } = req.body;

   const prompt = `
あなたは猫の気持ちをやさしく解説する日本語アシスタントです。
以下の観察情報から、飼い主向けに自然でわかりやすいコメントを作ってください。

猫の名前: ${petName}
性格タイプ: ${petType}
行動: ${action}
しっぽ: ${tail}
耳: ${ear}
鳴き声: ${voice}
目: ${eye}

条件:
- 日本語で返す
- やさしく自然な言い回しにする
- summary は2文以内
- advice は3文以内
- note は2文以内
- 長すぎる説明は避ける
- 同じ内容を繰り返さない
- JSON以外は返さない
- コードブロックは使わない
- 必ず有効なJSONのみを返す

次のJSONだけを返してください。
{
  "summary": "いまの気持ち",
  "advice": "おすすめの接し方",
  "note": "観察メモ"
}
`;

    const response = await client.responses.create({
  model: "gpt-5-nano",
  input: prompt
});

    const text = response.output_text;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({
        error: "AIの返答をJSONとして読めませんでした。",
        raw: text
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "サーバー側でエラーが起きました。"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});