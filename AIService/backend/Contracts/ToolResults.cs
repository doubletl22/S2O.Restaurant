namespace S2O.AIService.Contracts;

public sealed class ToolResult
{
    public required string ToolName { get; set; }
    public required object Data { get; set; }
}

public sealed class RagHit
{
    public required string Title { get; set; }
    public required string ChunkText { get; set; }
}
