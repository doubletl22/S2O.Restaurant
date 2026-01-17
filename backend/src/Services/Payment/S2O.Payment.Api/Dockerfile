FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/Services/Payment/S2O.Payment.Api/S2O.Payment.Api.csproj", "src/Services/Payment/S2O.Payment.Api/"]
COPY ["src/Services/Payment/S2O.Payment.Infra/S2O.Payment.Infra.csproj", "src/Services/Payment/S2O.Payment.Infra/"]
COPY ["src/Services/Payment/S2O.Payment.App/S2O.Payment.App.csproj", "src/Services/Payment/S2O.Payment.App/"]
COPY ["src/Services/Payment/S2O.Payment.Domain/S2O.Payment.Domain.csproj", "src/Services/Payment/S2O.Payment.Domain/"]

COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]

RUN dotnet restore "src/Services/Payment/S2O.Payment.Api/S2O.Payment.Api.csproj"

COPY . .

WORKDIR "/src/src/Services/Payment/S2O.Payment.Api"

RUN dotnet build "S2O.Payment.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "S2O.Payment.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Payment.Api.dll"]