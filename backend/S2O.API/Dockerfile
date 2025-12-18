# Sử dụng SDK để build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["backend/S2O.API/S2O.API.csproj", "backend/S2O.API/"]
COPY ["backend/S2O.Application/S2O.Application.csproj", "backend/S2O.Application/"]
COPY ["backend/S2O.Domain/S2O.Domain.csproj", "backend/S2O.Domain/"]
COPY ["backend/S2O.Infrastructure/S2O.Infrastructure.csproj", "backend/S2O.Infrastructure/"]
COPY ["backend/S2O.Shared/S2O.Shared.csproj", "backend/S2O.Shared/"] 
RUN dotnet restore "backend/S2O.API/S2O.API.csproj"

COPY . .
WORKDIR "/src/backend/S2O.API"
RUN dotnet build "S2O.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "S2O.API.csproj" -c Release -o /app/publish

# Sử dụng Runtime để chạy
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "S2O.API.dll"]