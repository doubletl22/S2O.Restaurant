using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Public;

public record GetPublicTableQuery(Guid TableId) : IRequest<Result<PublicTableInfo>>;
//public class GetPublicTableHandler : IRequestHandler<GetPublicTableQuery, Result<PublicTableInfo>>
//{}