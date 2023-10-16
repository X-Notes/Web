using DatabaseContext;
using DatabaseContext.Models;
using HealthChecks.UI.Client;
using HealthCheckWEB.HealthCheckers;
using HealthCheckWEB.Models.Azure;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;

var builder = WebApplication.CreateBuilder(args);

var configBuilder = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", reloadOnChange: true, optional: true)
    .AddUserSecrets<Program>()
    .AddEnvironmentVariables();

builder.Configuration.AddConfiguration(configBuilder.Build());

// INIT IDENTITY DB
var appDb = builder.Configuration.GetSection("HealthCheckerDatabaseConn").Value;
builder.Services.AddDbContext<ApplicationDatabaseContext>(options => options.UseNpgsql(appDb));
builder.Services.AddIdentity<User, Role>()
    .AddEntityFrameworkStores<ApplicationDatabaseContext>();
//

// Add services to the container.
builder.Services.AddControllersWithViews();

var nootsDbConn = builder.Configuration.GetSection("NootsDB").Value;
var elasticConn = builder.Configuration.GetSection("ElasticConfiguration:Uri").Value;
var nootsAPI = builder.Configuration.GetSection("NootsAPI").Value;
var storageConfig = builder.Configuration.GetSection("Azure").Get<AzureConfig>();

var nootsWorkersAPI = builder.Configuration.GetSection("NootsWorkersAPI").Value;
var nootsWorkersDbConn = builder.Configuration.GetSection("NootsWorkersDB").Value;

builder.Services.AddDaprClient();

// HEALTH CHECKER
builder.Services.AddHealthChecks()
                .AddElasticsearch(elasticConn)
                .AddNpgSql(nootsDbConn, name: "Noots Database")
                .AddNpgSql(appDb, name: "Health check Database")
                .AddNpgSql(nootsWorkersDbConn, name: "Noots workers Database")
                // .AddSignalRHub($"{nootsAPI}/api/hub", "Signal R")
                // .AddUrlGroup(
                //     new Uri($"{nootsAPI}/health"), name: "NOOTS API",
                //     failureStatus: HealthStatus.Unhealthy,
                //     timeout: TimeSpan.FromSeconds(3),
                //     tags: new string[] { "services" })
                // .AddUrlGroup(
                //     new Uri($"{nootsWorkersAPI}/health"), name: "Noots workers API",
                //     failureStatus: HealthStatus.Unhealthy,
                //     timeout: TimeSpan.FromSeconds(3),
                //     tags: new string[] { "services" })
                .AddCheck<AzureBlobStorageHealthChecker>("AzureBlobStorageChecker");


builder.Services.AddHealthChecksUI(setup =>
                {
                    setup.SetEvaluationTimeInSeconds(5);
                    setup.AddHealthCheckEndpoint("APPS", $"app-health");
                })
                .AddInMemoryStorage();

// AZURE STORAGE
builder.Services.AddSingleton(x => storageConfig);
builder.Services.AddAzureClients(builder =>
{
    builder.AddBlobServiceClient(storageConfig.StorageConnection);
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// HEALTH CHECK
// API URL /healthchecks-ui
app.MapHealthChecksUI().RequireAuthorization();
// app.UseHealthChecksUI(config => config.UIPath = "/app-health");

app.MapHealthChecks("/app-health", new HealthCheckOptions
{
    Predicate = registration => true,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();