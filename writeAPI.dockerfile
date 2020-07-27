FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /output
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src
COPY Backend/WriteAPI/ Backend/WriteAPI/
COPY Backend/Shared/ Backend/Shared/
WORKDIR Backend/WriteAPI/WriteAPI
RUN dotnet publish -c Release -o output

FROM base AS final
COPY --from=build /src/Backend/WriteAPI/WriteAPI/output .
ENTRYPOINT ["dotnet", "WriteAPI.dll"]
