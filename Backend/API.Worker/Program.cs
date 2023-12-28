using API.Worker.ConfigureAPP;
using API.Worker.Database;
using API.Worker.Database.Models;
using API.Worker.Filters;
using API.Worker.Models.Config;
using Common;
using Microsoft.EntityFrameworkCore;
using Hangfire;
using Common.Azure;
using DatabaseContext;
using Editor.Services;
using History;
using Mapper;
using Notes.Handlers.Commands;
using Serilog;
using Storage;

var builder = WebApplication.CreateBuilder(args);

var configBuilder = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", reloadOnChange: true, optional: true)
    .AddUserSecrets<Program>()
    .AddEnvironmentVariables();

builder.Host.UseSerilog();

builder.Configuration.AddConfiguration(configBuilder.Build());

var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

var seqSection = builder.Configuration.GetSection("Seq");
var seqConfig = seqSection.Get<SeqConfig>();
builder.Services.Configure<SeqConfig>(seqSection);

// INIT IDENTITY DB
var storageConfig = builder.Configuration.GetSection("Azure").Get<AzureConfig>();
var databaseConfig = builder.Configuration.GetSection("Database").Get<DatabaseConfig>();
builder.Services.Configure<DaprConfig>(builder.Configuration.GetSection("Dapr"));

builder.Services.AddDbContext<ApplicationDatabaseContext>(options => options.UseNpgsql(databaseConfig.WorkerDatabaseConnection));
builder.Services.AddIdentity<User, Role>()
    .AddEntityFrameworkStores<ApplicationDatabaseContext>();

builder.Services.SetupLogger(builder.Configuration, environment, seqConfig);

builder.Services.ApplyMapperDI();

// AZURE & STORAGE
builder.Services.ApplyAzureConfig(storageConfig);
builder.Services.ApplyFileRemoving();

builder.Services.ApplyDataBaseDI(databaseConfig.ApiDatabaseConnection);

// MAYBE ADD DI LOCK

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

builder.Services.AddScoped<CollectionLinkedService>();
builder.Services.AddScoped<DeleteNotesCommandHandler>();

builder.Services.ApplyMakeHistoryDI();
builder.Services.TimersConfig(builder.Configuration);
builder.Services.JOBS();
builder.Services.AddDaprClient();
builder.Services.AddHttpClient();
builder.Services.HangFireConfig(databaseConfig.WorkerDatabaseConnection);

builder.Services.AddHealthChecks();

// Add services to the container.
builder.Services.AddControllersWithViews();

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

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireDashboardAuthorizationFilter() }
});

app.MapHealthChecks("/health");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


await app.RunAsync();