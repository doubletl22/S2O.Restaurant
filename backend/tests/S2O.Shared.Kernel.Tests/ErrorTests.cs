using S2O.Shared.Kernel.Results;

namespace S2O.Shared.Kernel.Tests;

public class ErrorTests
{
    [Fact]
    public void NotFound_Should_CreateError_WithProvidedCodeAndDescription()
    {
        var error = Error.NotFound("Category.NotFound", "Category was not found");

        Assert.Equal("Category.NotFound", error.Code);
        Assert.Equal("Category was not found", error.Description);
    }

    [Fact]
    public void Conflict_Should_CreateError_WithProvidedCodeAndDescription()
    {
        var error = Error.Conflict("Category.Conflict", "Duplicate category name");

        Assert.Equal("Category.Conflict", error.Code);
        Assert.Equal("Duplicate category name", error.Description);
    }
}
