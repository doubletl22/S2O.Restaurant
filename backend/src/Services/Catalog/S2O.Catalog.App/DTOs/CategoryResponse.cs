namespace S2O.Catalog.App.DTOs;

public record CategoryResponse(
    Guid Id, 
    string Name, 
    string? Description
);