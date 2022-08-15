# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT DockerDev
EXPOSE 5600

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY Backend/NootsWEB/ source/
RUN dotnet restore "source/NootsWorkersWEB/NootsWorkersWEB.csproj"
COPY . .
WORKDIR "/src/source/NootsWorkersWEB"
RUN dotnet build "NootsWorkersWEB.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "NootsWorkersWEB.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5600
ENTRYPOINT ["dotnet", "NootsWorkersWEB.dll"]