using MediatR;
using S2O.Catalog.Domain.Entities; // Sử dụng Entity Product
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Public;

public record GetPublicMenuQuery(Guid TenantId, string? CategoryId) : IRequest<Result<List<Product>>>;