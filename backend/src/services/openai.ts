import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type SummarizeResult = {
  summary: string;
  category: string;
};

export async function summarizeEmail(input: {
  sender: string;
  subject: string;
  body: string;
}): Promise<SummarizeResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const prompt = `
You are an assistant that summarizes emails.

Summarize the email in 2–3 concise sentences and assign ONE category from this list:
- Meeting
- Invoice
- Support Request
- Promotion
- General

Return ONLY valid JSON in this shape:
{
  "summary": "two to three sentence summary here",
  "category": "One of: Meeting | Invoice | Support Request | Promotion | General"
}

Email data:
Sender: ${input.sender}
Subject: ${input.subject}
Body: ${input.body}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a precise email summarization and categorization assistant.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(content);
    if (!parsed.summary || !parsed.category) {
      throw new Error("Missing fields in model response");
    }
    return {
      summary: parsed.summary,
      category: parsed.category,
    };
  } catch (err) {
    console.error("Failed to parse OpenAI response, falling back.", err);
    return {
      summary: `Summary unavailable. Original subject: ${input.subject}`,
      category: "General",
    };
  }
}
