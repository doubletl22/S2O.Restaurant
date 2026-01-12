# 1. Base Image để chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# 2. Build Image để compile code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy các file .csproj của Payment Service
COPY ["src/Services/Payment/S2O.Payment.Api/S2O.Payment.Api.csproj", "src/Services/Payment/S2O.Payment.Api/"]
COPY ["src/Services/Payment/S2O.Payment.Infra/S2O.Payment.Infra.csproj", "src/Services/Payment/S2O.Payment.Infra/"]
COPY ["src/Services/Payment/S2O.Payment.App/S2O.Payment.App.csproj", "src/Services/Payment/S2O.Payment.App/"]
COPY ["src/Services/Payment/S2O.Payment.Domain/S2O.Payment.Domain.csproj", "src/Services/Payment/S2O.Payment.Domain/"]

# Copy các file .csproj của Shared Kernel & Infra (Quan trọng)
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]

# Restore dependencies
RUN dotnet restore "src/Services/Payment/S2O.Payment.Api/S2O.Payment.Api.csproj"

# Copy toàn bộ source code và Build
COPY . .
WORKDIR "/src/src/Services/Payment/S2O.Payment.Api"
RUN dotnet build "S2O.Payment.Api.csproj" -c Release -o /app/build

# 3. Publish ra file DLL
FROM build AS publish
RUN dotnet publish "S2O.Payment.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 4. Final Image (Copy từ bước Publish sang Base để chạy cho nhẹ)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Payment.Api.dll"]