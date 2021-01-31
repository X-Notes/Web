FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS base
WORKDIR /output
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:5.0-alpine AS build
WORKDIR /src
COPY Backend/WriteAPI/ Backend/WriteAPI/
COPY Backend/Shared/ Backend/Shared/
WORKDIR Backend/WriteAPI/WriteAPI
RUN dotnet publish -c Release -o output

FROM base AS final
COPY --from=build /src/Backend/WriteAPI/WriteAPI/output .
CMD ASPNETCORE_URLS=http://*:$PORT dotnet WriteAPI.dll