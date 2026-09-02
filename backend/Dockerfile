FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Install Node.js for Tailwind CSS build
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# Copy files
COPY ["EShopManager.API.csproj", "./"]
COPY ["package.json", "package-lock.json*", "./"]

# Restore .NET and npm dependencies
RUN dotnet restore "EShopManager.API.csproj"
RUN npm install

# Copy the rest of the code
COPY . .

# Build Tailwind CSS
RUN npm run build:css

# Publish .NET app
RUN dotnet publish "EShopManager.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
USER root
WORKDIR /app

# Install Node.js, Chromium and required libraries for email & PDF generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg chromium fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgtk-3-0 libnspr4 \
    libnss3 libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libx11-xcb1 \
    libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
    libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

ENV EShop_PDF_CHROME=/usr/bin/chromium

COPY --from=build /app/publish .
COPY --from=build /src/email ./email
COPY --from=build /src/pdf ./pdf
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/package.json ./package.json

# Expose port (Railway dynamically assigns PORT, but 8080 is default for .NET 8+)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "EShopManager.API.dll"]
