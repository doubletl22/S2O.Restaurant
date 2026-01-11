FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/Services/Identity/S2O.Identity.Api/S2O.Identity.Api.csproj", "src/Services/Identity/S2O.Identity.Api/"]
COPY ["src/Services/Identity/S2O.Identity.Infra/S2O.Identity.Infra.csproj", "src/Services/Identity/S2O.Identity.Infra/"]
COPY ["src/Services/Identity/S2O.Identity.App/S2O.Identity.App.csproj", "src/Services/Identity/S2O.Identity.App/"]
COPY ["src/Services/Identity/S2O.Identity.Domain/S2O.Identity.Domain.csproj", "src/Services/Identity/S2O.Identity.Domain/"]
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]

RUN dotnet restore "src/Services/Identity/S2O.Identity.Api/S2O.Identity.Api.csproj"
COPY . .
WORKDIR "/src/src/Services/Identity/S2O.Identity.Api"
RUN dotnet build "S2O.Identity.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "S2O.Identity.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Identity.Api.dll"]