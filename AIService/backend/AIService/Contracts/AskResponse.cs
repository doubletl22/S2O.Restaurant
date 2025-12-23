namespace S2O.AIService.Contracts;

public sealed class AskResponse
{
    public required string Intent { get; set; }
    public required string Answer { get; set; }
    public List<string> Sources { get; set; } = new();
}
