# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT DockerDev
# EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY Backend/NootsWEB/ source/
RUN dotnet restore "source/Noots.API/Noots.API.csproj"
COPY . .
WORKDIR "/src/source/Noots.API"
RUN dotnet build "Noots.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Noots.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "Noots.API.dll"]