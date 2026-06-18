using Microsoft.EntityFrameworkCore;
using TxApprovalSimulator.API.Data;
using TxApprovalSimulator.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITransactionService, TransactionService>();

const string ClientCorsPolicy = "AllowClient";
builder.Services.AddCors(options =>
{
    options.AddPolicy(ClientCorsPolicy, policy =>
        policy
            // Allow any localhost / 127.0.0.1 origin (any port) during development,
            // so it works regardless of which port `ng serve` picks or whether the
            // browser uses "localhost" vs "127.0.0.1".
            .SetIsOriginAllowed(origin =>
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                    return false;
                return uri.Host is "localhost" or "127.0.0.1";
            })
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Apply pending EF Core migrations on startup so the app is runnable with a single command.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// CORS must run before anything that can short-circuit the request (e.g. HTTPS redirect),
// otherwise the preflight (OPTIONS) gets a 307 redirect and the browser reports a CORS failure.
app.UseCors(ClientCorsPolicy);

// Only force HTTPS outside development. In dev the client talks to the plain-http endpoint,
// and an HTTPS redirect on the preflight would break CORS.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
