FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 \
    DOTNET_NOLOGO=true

# Copy project file and restore with single process to respect container memory
COPY ["EShopManager.API.csproj", "./"]
RUN dotnet restore "EShopManager.API.csproj" -m:1 --disable-build-servers

# Copy source code and publish
COPY . .
RUN dotnet publish "EShopManager.API.csproj" -c Release -o /app/publish /p:UseAppHost=false -m:1 --disable-build-servers

# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
USER root
WORKDIR /app

# Install Chromium and Node.js for background email & PDF generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium fonts-liberation nodejs npm \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgtk-3-0 libnspr4 \
    libnss3 libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libx11-xcb1 \
    libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
    libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

ENV EShop_PDF_CHROME=/usr/bin/chromium

COPY --from=build /app/publish .
COPY email ./email
COPY pdf ./pdf
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Expose port (Railway dynamically assigns PORT, but 8080 is default for .NET 8+)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "EShopManager.API.dll"]
