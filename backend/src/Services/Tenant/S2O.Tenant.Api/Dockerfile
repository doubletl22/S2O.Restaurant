FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy csproj và restore các thư viện (để tận dụng cache layer)
COPY ["src/Services/Tenant/S2O.Tenant.Api/S2O.Tenant.Api.csproj", "src/Services/Tenant/S2O.Tenant.Api/"]
COPY ["src/Services/Tenant/S2O.Tenant.Infra/S2O.Tenant.Infra.csproj", "src/Services/Tenant/S2O.Tenant.Infra/"]
COPY ["src/Services/Tenant/S2O.Tenant.App/S2O.Tenant.App.csproj", "src/Services/Tenant/S2O.Tenant.App/"]
COPY ["src/Services/Tenant/S2O.Tenant.Domain/S2O.Tenant.Domain.csproj", "src/Services/Tenant/S2O.Tenant.Domain/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]

RUN dotnet restore "src/Services/Tenant/S2O.Tenant.Api/S2O.Tenant.Api.csproj"

# 2. Copy toàn bộ source code
COPY . .
WORKDIR "/src/src/Services/Tenant/S2O.Tenant.Api"
RUN dotnet build "S2O.Tenant.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "S2O.Tenant.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Tenant.Api.dll"]