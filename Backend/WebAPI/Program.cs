using System.Globalization;
using API.Hosted;
using Auth.Entities;
using Common;
using Common.App;
using Common.Azure;
using Common.ConstraintsUploadFiles;
using Common.Filters;
using Common.Google;
using Common.Redis;
using Common.SignalR;
using DatabaseContext;
using Editor.Services;
using Mapper;
using MapperLocked;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Serilog;
using SignalrUpdater;
using SignalrUpdater.Impl;
using Storage;
using WebAPI;
using WebAPI.Hosted;
using WebAPI.Middlewares;
using WebAPI.Models;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, options) =>
{
    options.Limits.MaxRequestBodySize = FileSizeConstraints.MaxRequestFileSize; // TODO MAYBE MOVE
});

Console.WriteLine("builder.Environment.EnvironmentName: " + builder.Environment.EnvironmentName);

var configBuilder = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", reloadOnChange: true, optional: true)
    .AddUserSecrets<Program>()
    .AddEnvironmentVariables();


builder.Host.UseSerilog();

builder.Configuration.AddConfiguration(configBuilder.Build());

builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
const string defaultCulture = "en-US";
var supportedCultures = new[]
{
    new CultureInfo(defaultCulture),
    new CultureInfo("uk")
};
builder.Services.Configure<RequestLocalizationOptions>(options => {
    options.DefaultRequestCulture = new RequestCulture(defaultCulture);
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
});


builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = FileSizeConstraints.MaxRequestFileSize;
});

builder.Services.Configure<GoogleAuthClient>(builder.Configuration.GetSection("GoogleClient"));
builder.Services.Configure<AuthRequestOptions>(builder.Configuration.GetSection("AuthRequest"));

var seqSection = builder.Configuration.GetSection("Seq");
var seqConfig = seqSection.Get<SeqConfig>();
builder.Services.Configure<SeqConfig>(seqSection);

var jwtTokenConfig = builder.Configuration.GetSection("JwtConfig").Get<JwtTokenConfig>();
builder.Services.AddSingleton(jwtTokenConfig);
var googleConfig = builder.Configuration.GetSection("GoogleAuth").Get<GoogleAuth>();
builder.Services.AddSingleton(googleConfig);
var dbConn = builder.Configuration.GetSection("DatabaseConnection").Value;
var azureConfig = builder.Configuration.GetSection("Azure").Get<AzureConfig>();
var redisConfig = builder.Configuration.GetSection("Redis").Get<RedisConfig>();
// var origins = builder.Configuration.GetSection("Origins").Get<string[]>();
var controllersConfig = builder.Configuration.GetSection("Controllers").Get<ControllersActiveConfig>();
builder.Services.AddSingleton(x => controllersConfig);

Console.WriteLine("REDIS ACTIVE: " + redisConfig.Active);
Console.WriteLine("REDIS STR: "+ redisConfig.Connection);

var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

builder.Services.SetupLogger(builder.Configuration, environment, seqConfig);
builder.Services.ApplyAzureConfig(azureConfig);
builder.Services.JWT(jwtTokenConfig);
builder.Services.ApplyMapperDI();
builder.Services.ApplyMapperLockedDI();


// Add services to the container.
builder.Services.AddControllersWithViews(opt => opt.Filters.Add(new ValidationFilter()))
                .AddViewLocalization()
                .AddNewtonsoftJson();

builder.Services.AddScoped<DisableInProductionFilter>();

builder.Services.AddHealthChecks();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer(); // check
builder.Services.SetupSignalR(redisConfig);
builder.Services.AddSingleton<IUserIdProvider, IdProvider>();
builder.Services.Mediatr();
builder.Services.ApplyDataBaseDI(dbConn);
builder.Services.DapperDI(dbConn);
builder.Services.AddScoped<CollectionLinkedService>();
builder.Services.ApplySignalRDI();
builder.Services.AddMemoryCache();

builder.Services.AddHostedService<SetupServicesHosted>();
builder.Services.AddHostedService<HistoryProcessingHosted>();
builder.Services.AddHostedService<CopyNoteHosted>();

builder.Services.AddDaprClient();
builder.Services.AddHttpClient();
builder.Services.AddSwaggerGen();
// builder.Services.AddCors();

var spaPath = "Client/dist/app";

builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = spaPath;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("DockerDev"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var requestLocalizationOptions = app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>();
app.UseRequestLocalization(requestLocalizationOptions.Value);

app.UseStaticFiles();
app.UseSpaStaticFiles();

app.UseRouting();

/*
app.UseCors(builder => builder
    .WithOrigins(origins)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
    .SetPreflightMaxAge(TimeSpan.FromMinutes(5)));
*/

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapHub<AppSignalRHub>(HubSettings.endPoint);
app.MapHealthChecks("/health");

app.UseSpa(spa =>
{
    spa.Options.SourcePath = spaPath;
});

await app.RunAsync();