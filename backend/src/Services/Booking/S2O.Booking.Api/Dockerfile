# 1. Base Image để chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# 2. Build Image để compile code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy các file .csproj của Booking Service
COPY ["src/Services/Booking/S2O.Booking.Api/S2O.Booking.Api.csproj", "src/Services/Booking/S2O.Booking.Api/"]
COPY ["src/Services/Booking/S2O.Booking.Infra/S2O.Booking.Infra.csproj", "src/Services/Booking/S2O.Booking.Infra/"]
COPY ["src/Services/Booking/S2O.Booking.App/S2O.Booking.App.csproj", "src/Services/Booking/S2O.Booking.App/"]
COPY ["src/Services/Booking/S2O.Booking.Domain/S2O.Booking.Domain.csproj", "src/Services/Booking/S2O.Booking.Domain/"]

# Copy các file .csproj của Shared Kernel & Infra (Quan trọng)
COPY ["src/BuildingBlocks/S2O.Shared.Kernel/S2O.Shared.Kernel.csproj", "src/BuildingBlocks/S2O.Shared.Kernel/"]
COPY ["src/BuildingBlocks/S2O.Shared.Infra/S2O.Shared.Infra.csproj", "src/BuildingBlocks/S2O.Shared.Infra/"]

# Restore dependencies
RUN dotnet restore "src/Services/Booking/S2O.Booking.Api/S2O.Booking.Api.csproj"

# Copy toàn bộ source code và Build
COPY . .
WORKDIR "/src/src/Services/Booking/S2O.Booking.Api"
RUN dotnet build "S2O.Booking.Api.csproj" -c Release -o /app/build

# 3. Publish ra file DLL
FROM build AS publish
RUN dotnet publish "S2O.Booking.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 4. Final Image (Copy từ bước Publish sang Base để chạy cho nhẹ)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.Booking.Api.dll"]