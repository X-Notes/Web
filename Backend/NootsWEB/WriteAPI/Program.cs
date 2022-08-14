using AspNetCoreRateLimit;
using BI.SignalR;
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
using Noots.Mapper.Mapping;
using Noots.MapperLocked;
using Noots.Storage;
using Serilog;
using System;
using System.IO;
using WriteAPI.ConfigureAPP;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.Filters;
using WriteAPI.Hosted;
using WriteAPI.Middlewares;
using WriteContext;

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
var storageConfig = builder.Configuration.GetSection("Azure").Get<AzureConfig>();

var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

builder.Services.SetupLogger(builder.Configuration, environment);

builder.Services.ApplyAzureConfig(storageConfig);
builder.Services.TimersConfig(builder.Configuration);
builder.Services.JWT(builder.Configuration);


builder.Services.ApplyMapperDI();
builder.Services.ApplyMapperLockedDI();

builder.Services.AddControllers(opt => opt.Filters.Add(new ValidationFilter()))
                .AddNewtonsoftJson();

builder.Services.AddHealthChecks();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer(); // check

builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, IdProvider>();

builder.Services.Mediatr();

builder.Services.ApplyDataBaseDI(dbConn);

builder.Services.BI();

builder.Services.AddMemoryCache();

// RATE LIMITER
//load general configuration from appsettings.json
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
//load ip rules from appsettings.json
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
// inject counter and rules stores
builder.Services.AddInMemoryRateLimiting();

builder.Services.AddHostedService<ManageUsersOnEntitiesHosted>();
builder.Services.AddHostedService<SetupServicesHosted>();
builder.Services.AddHostedService<StartDBCleanerHosted>();

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
app.MapHub<AppSignalRHub>("/hub");

app.MapHealthChecks("/health");

await app.RunAsync();