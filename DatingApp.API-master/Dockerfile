FROM microsoft/dotnet:2.2-aspnetcore-runtime AS base
WORKDIR /app
COPY . .

CMD ASPNETCORE_URLS=http://*:$PORT dotnet DatingApp.API.dll