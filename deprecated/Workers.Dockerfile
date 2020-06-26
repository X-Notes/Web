FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /output

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /src
COPY Workers/ Workers/
COPY Shared/ Shared/
WORKDIR Workers/Workers
RUN dotnet publish -c Release -o output

FROM base AS final
RUN apt-get update \
    && apt-get install -y --allow-unauthenticated \
        libc6-dev \
        libgdiplus \
        libx11-dev \
     && rm -rf /var/lib/apt/lists/*
COPY --from=build /src/Workers/Workers/output .
ENTRYPOINT ["dotnet", "Workers.dll"]