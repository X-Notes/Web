# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT DockerDev
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY Backend/WriteAPI/ source/
RUN dotnet restore "source/WriteAPI/WriteAPI.csproj"
COPY . .
WORKDIR "/src/source/WriteAPI"
RUN dotnet build "WriteAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WriteAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WriteAPI.dll"]