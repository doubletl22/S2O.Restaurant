namespace S2O.Shared.Kernel.Results;

public record Error(string Code, string Description)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NullValue = new("Error.NullValue", "Giá trị trả về bị null.");
    public static Error NotFound(string code, string description) => new(code, description);
    public static Error Validation(string code, string description) => new(code, description);
    public static Error Conflict(string code, string description) => new(code, description);
    public static Error Failure(string code, string description) => new(code, description);
}