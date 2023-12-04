# syntax=docker/dockerfile:1
FROM node:16 AS nodeBuilder
WORKDIR /clientApp

COPY Backend/WebAPI/Client .

RUN yarn && \
    yarn dev

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT Dev
# EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY Backend/ source/

COPY --from=nodeBuilder /clientApp/dist/app/ source/WebAPI/Client/dist/app/

RUN dotnet restore "source/WebAPI/WebAPI.csproj"
COPY . .
WORKDIR "/src/source/WebAPI"

RUN dotnet build "WebAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WebAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "WebAPI.dll"]