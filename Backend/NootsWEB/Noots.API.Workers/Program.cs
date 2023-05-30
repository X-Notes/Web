using Microsoft.EntityFrameworkCore;
using Hangfire;
using Noots.Storage;
using Common.Azure;
using Noots.Mapper;
using Noots.History;
using MediatR;
using Noots.DatabaseContext;
using Noots.API.Workers.ConfigureAPP;
using Noots.API.Workers.Database;
using Noots.API.Workers.Database.Models;
using Noots.API.Workers.Filters;

var builder = WebApplication.CreateBuilder(args);

var configBuilder = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", reloadOnChange: true, optional: true)
    .AddEnvironmentVariables();

builder.Configuration.AddConfiguration(configBuilder.Build());

// INIT IDENTITY DB
var appDb = builder.Configuration.GetSection("DatabaseConnection").Value;
var dbConn = builder.Configuration.GetSection("NootsDatabaseConnection").Value;
var storageConfig = builder.Configuration.GetSection("Azure").Get<AzureConfig>();

builder.Services.AddDbContext<ApplicationDatabaseContext>(options => options.UseNpgsql(appDb));
builder.Services.AddIdentity<User, Role>()
    .AddEntityFrameworkStores<ApplicationDatabaseContext>();
//

builder.Services.ApplyMapperDI();

// AZURE & STORAGE
builder.Services.ApplyAzureConfig(storageConfig);
builder.Services.ApplyFileRemoving();

builder.Services.ApplyDataBaseDI(dbConn);

// MAYBE ADD DI LOCK

builder.Services.AddMediatR(typeof(Program));

builder.Services.ApplyMakeHistoryDI();
builder.Services.TimersConfig(builder.Configuration);
builder.Services.JOBS();

builder.Services.AddHttpClient();
builder.Services.HangFireConfig(appDb);

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


app.Run();
