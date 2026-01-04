
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/Services/Ordering/S2O.Services.Ordering.API/S2O.Services.Ordering.API.csproj", "src/Services/Ordering/S2O.Services.Ordering.API/"]
COPY ["src/Services/Ordering/S2O.Services.Ordering.Application/S2O.Services.Ordering.Application.csproj", "src/Services/Ordering/S2O.Services.Ordering.Application/"]
COPY ["src/Services/Ordering/S2O.Services.Ordering.Domain/S2O.Services.Ordering.Domain.csproj", "src/Services/Ordering/S2O.Services.Ordering.Domain/"]
COPY ["src/Services/Ordering/S2O.Services.Ordering.Infrastructure/S2O.Services.Ordering.Infrastructure.csproj", "src/Services/Ordering/S2O.Services.Ordering.Infrastructure/"]
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]

# Restore
RUN dotnet restore "src/Services/Ordering/S2O.Services.Ordering.API/S2O.Services.Ordering.API.csproj"

# Copy toàn bộ code còn lại
COPY . .
WORKDIR "/src/src/Services/Ordering/S2O.Services.Ordering.API"
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# 2. Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Services.Ordering.API.dll"]