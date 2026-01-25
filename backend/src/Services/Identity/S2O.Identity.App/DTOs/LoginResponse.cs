namespace S2O.Identity.App.DTOs;

public record LoginResponse(string AccessToken, UserDto User);

public record UserDto(string Id, string Email, string FullName, List<string> Roles);