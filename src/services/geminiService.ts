import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const summarizeAnnouncement = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음 아파트 공지사항을 모바일에서 읽기 좋게 3줄 요약해줘. 친절한 말투로 작성해줘. 중요 표시를 위해 별표(**)와 같은 마크다운 기호를 사용하지 말고 텍스트로만 작성해줘:\n\n${content}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return content;
  }
};

export const summarizeDailyAnnouncements = async (announcements: { title: string; content: string }[]) => {
  if (announcements.length === 0) return "오늘 등록된 공지사항이 없습니다.";
  
  const combinedContent = announcements.map(a => `제목: ${a.title}\n내용: ${a.content}`).join("\n\n---\n\n");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `다음은 오늘 야학당 아파트에 올라온 여러 공지사항들입니다. 전체 내용을 종합하여 입주민들이 꼭 알아야 할 핵심 내용을 친절하고 명확하게 요약해줘. 미래 지향적인 느낌의 말투를 사용해줘. 중요 표시를 위해 별표(**)와 같은 마크다운 기호를 사용하지 말고 텍스트로만 작성해줘:\n\n${combinedContent}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Daily Summary Error:", error);
    return "요약 중 오류가 발생했습니다.";
  }
};
