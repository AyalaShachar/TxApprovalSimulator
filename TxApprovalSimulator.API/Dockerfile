# ---- Build ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["TxApprovalSimulator.API.csproj", "./"]
RUN dotnet restore "TxApprovalSimulator.API.csproj"

COPY . .
RUN dotnet publish "TxApprovalSimulator.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---- Runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "TxApprovalSimulator.API.dll"]
