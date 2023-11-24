using API.Worker.ConfigureAPP;
using API.Worker.Database;
using API.Worker.Database.Models;
using API.Worker.Filters;
using Microsoft.EntityFrameworkCore;
using Hangfire;
using Common.Azure;
using DatabaseContext;
using Editor.Services;
using History;
using Mapper;
using MediatR;
using Noots.DatabaseContext;
using Notes.Handlers.Commands;
using Storage;

var builder = WebApplication.CreateBuilder(args);

var configBuilder = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", reloadOnChange: true, optional: true)
    .AddUserSecrets<Program>()
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

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

builder.Services.AddScoped<CollectionLinkedService>();
builder.Services.AddScoped<DeleteNotesCommandHandler>();

builder.Services.ApplyMakeHistoryDI();
builder.Services.TimersConfig(builder.Configuration);
builder.Services.JOBS();
builder.Services.AddDaprClient();
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