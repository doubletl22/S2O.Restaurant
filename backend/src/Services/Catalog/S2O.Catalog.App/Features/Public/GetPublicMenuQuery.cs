using MediatR;
using S2O.Catalog.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Public;

public record GetPublicMenuQuery(Guid TenantId) : IRequest<Result<IEnumerable<CategoryResponse>>>;