# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT DockerDev
# EXPOSE 5900

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY Backend/HealthCheckerWEB/ source/
RUN dotnet restore "source/HealthCheckWEB/HealthCheckWEB.csproj"
COPY . .
WORKDIR "/src/source/HealthCheckWEB"
RUN dotnet build "HealthCheckWEB.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HealthCheckWEB.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# ENV ASPNETCORE_URLS=http://+:5900
ENTRYPOINT ["dotnet", "HealthCheckWEB.dll"]