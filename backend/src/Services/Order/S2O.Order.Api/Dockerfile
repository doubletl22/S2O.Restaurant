FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/Services/Order/S2O.Order.Api/S2O.Order.Api.csproj", "src/Services/Order/S2O.Order.Api/"]
COPY ["src/Services/Order/S2O.Order.Infra/S2O.Order.Infra.csproj", "src/Services/Order/S2O.Order.Infra/"]
COPY ["src/Services/Order/S2O.Order.App/S2O.Order.App.csproj", "src/Services/Order/S2O.Order.App/"]
COPY ["src/Services/Order/S2O.Order.Domain/S2O.Order.Domain.csproj", "src/Services/Order/S2O.Order.Domain/"]
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]

RUN dotnet restore "src/Services/Order/S2O.Order.Api/S2O.Order.Api.csproj"
COPY . .
WORKDIR "/src/src/Services/Order/S2O.Order.Api"
RUN dotnet build "S2O.Order.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "S2O.Order.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Order.Api.dll"]