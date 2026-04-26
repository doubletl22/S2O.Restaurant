using S2O.Shared.Kernel.Results;

namespace S2O.Shared.Kernel.Tests;

public class PagedResultTests
{
    [Fact]
    public void TotalPages_Should_BeCalculatedCorrectly()
    {
        var items = new List<int> { 1, 2, 3 };
        var paged = new PagedResult<int>(items, count: 25, pageIndex: 1, pageSize: 10);

        Assert.Equal(3, paged.TotalPages);
        Assert.Equal(25, paged.TotalCount);
        Assert.Equal(10, paged.PageSize);
    }

    [Fact]
    public void Constructor_Should_KeepInputItemsReference()
    {
        var items = new List<string> { "A", "B" };
        var paged = new PagedResult<string>(items, count: 2, pageIndex: 1, pageSize: 10);

        Assert.Equal(2, paged.Items.Count);
        Assert.Equal("A", paged.Items[0]);
        Assert.Equal("B", paged.Items[1]);
    }
}
