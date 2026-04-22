import { NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type TranslateSection = "assets" | "backgrounds";

const SYSTEM_PROMPT_ASSETS = `请分析用户提供的中文描述，并将其转化为高度详细的英文审美提示词（SD Prompt），且仅针对中心主体进行刻画。

描述维度：

形态与结构：形状、几何特征、结构化设计、材质纹理。

艺术风格：特定的美术流派、设计风格、表现手法。

色彩组合：精确的调色板、光影色调。

严禁项：

禁止包含任何背景、环境或周边装饰的描述。

禁止包含图像质量词汇（例如：'highres', '4k', 'masterpiece' 等）。

输出要求：

仅输出英文关键词，并以逗号分隔。`;

const SYSTEM_PROMPT_BACKGROUNDS = `请将输入的中文自然语言描述转化为详细的英文全场景审美提示词（SD Prompt）。

描述维度：

主体（Subject）：主体的形态、服饰、姿态及纹理细节。

环境背景（Environment/Background）：地理位置、自然景观、建筑元素、植被或室内细节。

构图与光影（Composition & Lighting）：景别（如 wide shot）、视角（如 low angle）、光照类型（如 cinematic lighting, volumetric fog）、光影对比。

色彩与艺术风格（Color & Style）：色调倾向（如 teal and orange）、特定的艺术流派、媒介类型（如 oil painting, digital art）。

严禁项：

禁止包含任何图像质量通用词（如 'best quality', '4k', 'HD', 'ultra-detailed' 等）。

输出要求：

仅输出英文关键词，并以逗号分隔。`;

function systemPromptForSection(section: TranslateSection): string {
  return section === "backgrounds" ? SYSTEM_PROMPT_BACKGROUNDS : SYSTEM_PROMPT_ASSETS;
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY is not configured" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text =
    typeof body === "object" &&
    body !== null &&
    "text" in body &&
    typeof (body as { text: unknown }).text === "string"
      ? (body as { text: string }).text.trim()
      : "";

  if (!text) {
    return NextResponse.json({ error: "Missing or empty text" }, { status: 400 });
  }

  const rawSection =
    typeof body === "object" &&
    body !== null &&
    "section" in body &&
    typeof (body as { section: unknown }).section === "string"
      ? (body as { section: string }).section
      : "assets";
  const section: TranslateSection =
    rawSection === "backgrounds" ? "backgrounds" : "assets";

  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPromptForSection(section) },
    { role: "user", content: text },
  ];

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.3,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: "DeepSeek API error", detail: errText.slice(0, 500) },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "Empty model response" }, { status: 502 });
  }

  return NextResponse.json({ translated: content });
}
