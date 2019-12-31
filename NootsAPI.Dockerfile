FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /output
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src
COPY NootsAPI/ NootsAPI/
COPY Shared/ Shared/
WORKDIR NootsAPI/NootsAPI
RUN dotnet publish -c Release -o output

FROM base AS final
COPY --from=build /src/NootsAPI/NootsAPI/output .
ENTRYPOINT ["dotnet", "NootsAPI.dll"]
