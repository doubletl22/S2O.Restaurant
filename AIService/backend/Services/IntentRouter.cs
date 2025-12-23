namespace S2O.AIService.Services;

public sealed class IntentRouter
{
    public string DetectIntent(string message)
    {
        var m = message.Trim().ToLowerInvariant();

        // tool intents
        if (m.Contains("giờ mở") || m.Contains("mấy giờ") || m.Contains("đóng cửa") || m.Contains("mở cửa"))
            return "OPEN_HOURS";

        if (m.Contains("còn không") || m.Contains("hết chưa") || m.Contains("còn món") || m.Contains("hết món"))
            return "MENU_AVAILABILITY";

        if (m.Contains("bàn trống") || m.Contains("còn bàn") || m.Contains("trống không"))
            return "TABLE_AVAILABILITY";

        if (m.Contains("bán chạy") || m.Contains("best seller") || m.Contains("món hot"))
            return "BEST_SELLERS";

        if (m.Contains("đặt bàn") || m.Contains("reservation"))
            return "RESERVATION_HELP";

        // default rag
        return "RAG_QA";
    }
}
