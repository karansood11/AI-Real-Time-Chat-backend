"use strict";

const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this._client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this._model = this._client.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
  }

  /**
   * Suggest a reply based on recent chat history.
   * @param {Array<{name: string, text: string}>} messages - Recent chat messages
   * @param {string} currentUserName - The user requesting the suggestion
   * @returns {Promise<string>} Suggested reply text
   */
  async suggestReply(messages, currentUserName) {
    try {
      const historyText = messages
        .slice(-10)
        .map((m) => `${m.name}: ${m.text}`)
        .join("\n");

      const prompt = `You are a helpful assistant in a group chat. Based on the following recent conversation, suggest a short, natural reply for "${currentUserName}" to send next. Return only the reply text, no quotes or explanation.\n\nConversation:\n${historyText}\n\nSuggested reply for ${currentUserName}:`;

      const result = await this._model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();
      return text;
    } catch (error) {
      console.error("Gemini API error:", error.message);
      throw new Error("AI service unavailable");
    }
  }
}

module.exports = new GeminiService();
