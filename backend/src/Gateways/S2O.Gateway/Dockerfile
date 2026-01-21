FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/Gateways/S2O.Gateway/S2O.Gateway.csproj", "src/Gateways/S2O.Gateway/"]
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]

RUN dotnet restore "src/Gateways/S2O.Gateway/S2O.Gateway.csproj"
COPY . .
WORKDIR "/src/src/Gateways/S2O.Gateway"
RUN dotnet build "S2O.Gateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "S2O.Gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Gateway.dll"]