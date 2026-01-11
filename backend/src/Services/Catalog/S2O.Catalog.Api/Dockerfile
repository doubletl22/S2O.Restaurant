FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy các file .csproj để restore trước (tối ưu cache)
COPY ["src/Services/Catalog/S2O.Catalog.Api/S2O.Catalog.Api.csproj", "src/Services/Catalog/S2O.Catalog.Api/"]
COPY ["src/Services/Catalog/S2O.Catalog.Infra/S2O.Catalog.Infra.csproj", "src/Services/Catalog/S2O.Catalog.Infra/"]
COPY ["src/Services/Catalog/S2O.Catalog.App/S2O.Catalog.App.csproj", "src/Services/Catalog/S2O.Catalog.App/"]
COPY ["src/Services/Catalog/S2O.Catalog.Domain/S2O.Catalog.Domain.csproj", "src/Services/Catalog/S2O.Catalog.Domain/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]

RUN dotnet restore "src/Services/Catalog/S2O.Catalog.Api/S2O.Catalog.Api.csproj"

# Copy toàn bộ code và build
COPY . .
WORKDIR "/src/src/Services/Catalog/S2O.Catalog.Api"
RUN dotnet build "S2O.Catalog.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "S2O.Catalog.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Catalog.Api.dll"]