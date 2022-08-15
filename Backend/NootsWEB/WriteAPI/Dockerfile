#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["WriteAPI/WriteAPI.csproj", "WriteAPI/"]
COPY ["BI/BI.csproj", "BI/"]
COPY ["Common/Common.csproj", "Common/"]
COPY ["ContentProcessing/ContentProcessing.csproj", "ContentProcessing/"]
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Storage/Storage.csproj", "Storage/"]
COPY ["WriteContext/WriteContext.csproj", "WriteContext/"]
COPY ["FakeData/FakeData.csproj", "FakeData/"]
RUN dotnet restore "WriteAPI/WriteAPI.csproj"
COPY . .
WORKDIR "/src/WriteAPI"
RUN dotnet build "WriteAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WriteAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WriteAPI.dll"]