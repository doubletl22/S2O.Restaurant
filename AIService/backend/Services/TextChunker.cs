namespace S2O.AIService.Services;

public sealed class TextChunker
{
    // chunk đơn giản theo độ dài ký tự (demo ổn)
    public List<string> Chunk(string text, int chunkSize = 900, int overlap = 120)
    {
        var chunks = new List<string>();
        if (string.IsNullOrWhiteSpace(text)) return chunks;

        var t = text.Trim();
        int i = 0;

        while (i < t.Length)
        {
            int len = Math.Min(chunkSize, t.Length - i);
            var part = t.Substring(i, len);

            chunks.Add(part);

            i += (chunkSize - overlap);
            if (i < 0) break;
        }
        return chunks;
    }
}
