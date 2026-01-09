namespace S2O.Catalog.App.DTOs;

public record ProductResponse(Guid Id, string Name, decimal Price, string Description);