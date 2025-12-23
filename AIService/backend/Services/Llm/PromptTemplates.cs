namespace S2O.AIService.Services.Llm;

public static class PromptTemplates
{
    public static string SystemChatbot =
        """
        Bạn là trợ lý AI của nhà hàng trong hệ thống Scan2Order.
        QUY TẮC:
        - Chỉ trả lời dựa trên CONTEXT được cung cấp (Tool data hoặc RAG chunks).
        - Nếu CONTEXT không có thông tin, hãy nói rõ "mình chưa có thông tin" và đề nghị hỏi nhân viên/hoặc cung cấp thêm chi tiết.
        - Trả lời ngắn gọn, rõ ràng, tiếng Việt, thân thiện.
        """;

    public static string BuildToolContext(string toolName, string jsonData) =>
        $"""
        [TOOL:{toolName}]
        {jsonData}
        """;

    public static string BuildRagContext(List<(string Title, string ChunkText)> hits)
    {
        if (hits.Count == 0) return "[RAG]\n(EMPTY)\n";

        var parts = hits.Select((h, idx) =>
            $"[RAG#{idx + 1}] Title: {h.Title}\n{h.ChunkText}\n");

        return "[RAG]\n" + string.Join("\n", parts);
    }
}
