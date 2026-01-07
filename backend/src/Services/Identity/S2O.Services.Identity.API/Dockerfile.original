# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy các file .csproj và restore (Lớp này sẽ được cache để build nhanh hơn)
COPY ["src/Services/Identity/S2O.Services.Identity.API/S2O.Services.Identity.API.csproj", "src/Services/Identity/S2O.Services.Identity.API/"]
COPY ["src/Services/Identity/S2O.Services.Identity.Application/S2O.Services.Identity.Application.csproj", "src/Services/Identity/S2O.Services.Identity.Application/"]
COPY ["src/Services/Identity/S2O.Services.Identity.Domain/S2O.Services.Identity.Domain.csproj", "src/Services/Identity/S2O.Services.Identity.Domain/"]
COPY ["src/Services/Identity/S2O.Services.Identity.Infrastructure/S2O.Services.Identity.Infrastructure.csproj", "src/Services/Identity/S2O.Services.Identity.Infrastructure/"]
# Nếu có Shared Kernel
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]

RUN dotnet restore "src/Services/Identity/S2O.Services.Identity.API/S2O.Services.Identity.API.csproj"

# Copy toàn bộ code còn lại
COPY . .
WORKDIR "/src/src/Services/Identity/S2O.Services.Identity.API"
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# 2. Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Services.Identity.API.dll"]