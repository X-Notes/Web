# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT DockerDev
EXPOSE 5600

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY Backend/NootsWEB/ source/
RUN dotnet restore "source/Noots.API.Workers/Noots.API.Workers.csproj"
COPY . .
WORKDIR "/src/source/Noots.API.Workers"
RUN dotnet build "Noots.API.Workers.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Noots.API.Workers.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5600
ENTRYPOINT ["dotnet", "Noots.API.Workers.dll"]