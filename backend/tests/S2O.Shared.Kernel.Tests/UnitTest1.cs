using S2O.Shared.Kernel.Results;

namespace S2O.Shared.Kernel.Tests;

public class ResultTests
{
    [Fact]
    public void Success_Should_BeMarkedAsSuccess_AndContainNoneError()
    {
        var result = Result.Success();

        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Equal(Error.None, result.Error);
    }

    [Fact]
    public void Failure_Should_BeMarkedAsFailure_AndContainProvidedError()
    {
        var error = Error.Validation("Validation.Name", "Name is required");
        var result = Result.Failure(error);

        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Equal(error, result.Error);
    }

    [Fact]
    public void GenericFailure_ValueAccess_ShouldThrowInvalidOperationException()
    {
        var result = Result<int>.Failure(Error.Failure("General", "General failure"));

        Assert.Throws<InvalidOperationException>(() => _ = result.Value);
    }
}
