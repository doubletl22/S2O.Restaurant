FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/Services/Restaurant/S2O.Services.Restaurant.API/S2O.Services.Restaurant.API.csproj", "src/Services/Restaurant/S2O.Services.Restaurant.API/"]
COPY ["src/Services/Restaurant/S2O.Services.Restaurant.Application/S2O.Services.Restaurant.Application.csproj", "src/Services/Restaurant/S2O.Services.Restaurant.Application/"]
COPY ["src/Services/Restaurant/S2O.Services.Restaurant.Domain/S2O.Services.Restaurant.Domain.csproj", "src/Services/Restaurant/S2O.Services.Restaurant.Domain/"]
COPY ["src/Services/Restaurant/S2O.Services.Restaurant.Infrastructure/S2O.Services.Restaurant.Infrastructure.csproj", "src/Services/Restaurant/S2O.Services.Restaurant.Infrastructure/"]

COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]

RUN dotnet restore "src/Services/Restaurant/S2O.Services.Restaurant.API/S2O.Services.Restaurant.API.csproj"

COPY . .
WORKDIR "/src/src/Services/Restaurant/S2O.Services.Restaurant.API"

RUN dotnet build -c Release -o /app/build
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Services.Restaurant.API.dll"]