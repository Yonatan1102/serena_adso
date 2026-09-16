FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY WebApplication1.csproj .
RUN dotnet restore WebApplication1.csproj
COPY . .
RUN dotnet restore WebApplication1.csproj
RUN dotnet publish WebApplication1.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WebApplication1.dll"]
