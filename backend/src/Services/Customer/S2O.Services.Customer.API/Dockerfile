# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj
COPY ["src/Services/Customer/S2O.Services.Customer.API/S2O.Services.Customer.API.csproj", "src/Services/Customer/S2O.Services.Customer.API/"]
COPY ["src/Services/Customer/S2O.Services.Customer.Application/S2O.Services.Customer.Application.csproj", "src/Services/Customer/S2O.Services.Customer.Application/"]
COPY ["src/Services/Customer/S2O.Services.Customer.Domain/S2O.Services.Customer.Domain.csproj", "src/Services/Customer/S2O.Services.Customer.Domain/"]
COPY ["src/Services/Customer/S2O.Services.Customer.Infrastructure/S2O.Services.Customer.Infrastructure.csproj", "src/Services/Customer/S2O.Services.Customer.Infrastructure/"]
# Nếu có Shared Kernel
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]
RUN dotnet restore "src/Services/Customer/S2O.Services.Customer.API/S2O.Services.Customer.API.csproj"

# Copy code
COPY . .
WORKDIR "/src/src/Services/Customer/S2O.Services.Customer.API"
RUN dotnet build -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# 2. Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Services.Customer.API.dll"]