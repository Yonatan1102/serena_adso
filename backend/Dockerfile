FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/*.csproj ./
RUN dotnet restore WebApplication1.csproj
COPY backend/. .
RUN dotnet publish WebApplication1.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=build /app/publish .
RUN chown -R app:app /app

USER app
EXPOSE 8080
ENV ASPNETCORE_URLS=https://+:8081;http://+:8080
ENTRYPOINT ["dotnet", "WebApplication1.dll"]
