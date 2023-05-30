using AspNetCoreRateLimit;
using Common.Azure;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Noots.Mapper;
using Noots.MapperLocked;
using Noots.SignalrUpdater;
using Noots.SignalrUpdater.Impl;
using Noots.Storage;
using Serilog;
using System;
using System.IO;
using Noots.DatabaseContext;
using WriteAPI.ConfigureAPP;
using WriteAPI.Hosted;
using WriteAPI.Middlewares;
using Common.Redis;
using Common.ConstraintsUploadFiles;
using Common.Filters;

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
    .AddEnvironmentVariables();


builder.Host.UseSerilog();

builder.Configuration.AddConfiguration(configBuilder.Build());

// Add services to the container.

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = FileSizeConstraints.MaxRequestFileSize;
});


FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile("noots-storm-firebase.json")
});


var dbConn = builder.Configuration.GetSection("WriteDB").Value;
var azureConfig = builder.Configuration.GetSection("Azure").Get<AzureConfig>();
var redisConfig = builder.Configuration.GetSection("Redis").Get<RedisConfig>();

Console.WriteLine("REDIS ACTIVE: " + redisConfig.Active);
Console.WriteLine("REDIS STR: "+ redisConfig.Connection);

var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

builder.Services.SetupLogger(builder.Configuration, environment);

builder.Services.ApplyAzureConfig(azureConfig);
builder.Services.TimersConfig(builder.Configuration);
builder.Services.JWT(builder.Configuration);


builder.Services.ApplyMapperDI();
builder.Services.ApplyMapperLockedDI();

builder.Services.AddControllers(opt => opt.Filters.Add(new ValidationFilter()))
                .AddNewtonsoftJson();

builder.Services.AddHealthChecks();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer(); // check

builder.Services.SetupSignalR(redisConfig);

builder.Services.AddSingleton<IUserIdProvider, IdProvider>();

builder.Services.Mediatr();

builder.Services.ApplyDataBaseDI(dbConn);

builder.Services.BI();
builder.Services.ApplySignalRDI();

builder.Services.AddMemoryCache();

// RATE LIMITER
//load general configuration from appsettings.json
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
//load ip rules from appsettings.json
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
// inject counter and rules stores
builder.Services.AddInMemoryRateLimiting();

builder.Services.AddHostedService<SetupServicesHosted>();

builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

builder.Services.AddHttpClient();

builder.Services.AddSwaggerGen();

// APP

var app = builder.Build();

// Configure the HTTP request pipeline.
Console.WriteLine("is DockerDev: " + app.Environment.IsEnvironment("DockerDev"));

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("DockerDev"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var isHostASP = false;
if (isHostASP && !string.IsNullOrEmpty(builder.Environment.WebRootPath))
{
    var path = Path.Combine(builder.Environment.WebRootPath);
    app.UseStaticFiles(new StaticFileOptions
    {
        ServeUnknownFileTypes = true,
        FileProvider = new PhysicalFileProvider(path)
    });
}

app.UseRouting();

if (isHostASP && !string.IsNullOrEmpty(builder.Environment.WebRootPath))
{
    var path = Path.Combine(builder.Environment.WebRootPath);
    app.MapFallbackToFile("index.html", new StaticFileOptions()
    {
        ServeUnknownFileTypes = true,
        FileProvider = new PhysicalFileProvider(path),
    });
}


app.UseIpRateLimiting();

app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<AppSignalRHub>(HubSettings.endPoint);

app.MapHealthChecks("/health");

await app.RunAsync();