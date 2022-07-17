using AspNetCoreRateLimit;
using BI.Mapping;
using BI.SignalR;
using Common.Azure;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Hangfire;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using System;
using WriteAPI.ConfigureAPP;
using WriteAPI.ConstraintsUploadFiles;
using WriteAPI.Filters;
using WriteAPI.HealthCheckers;
using WriteAPI.Hosted;
using WriteAPI.Middlewares;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel((context, options) =>
{
    options.Limits.MaxRequestBodySize = FileSizeConstraints.MaxRequestFileSize; // TODO MAYBE MOVE
});

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

builder.Services.AddCors(o => o.AddPolicy("MyPolicy", builder =>
{
    builder.AllowAnyMethod()
           .AllowAnyHeader()
           .AllowCredentials()
           .WithOrigins("http://localhost:4200", "http://localhost:8080", "http://localhost", "http://noots.westeurope.cloudapp.azure.com");
}));

FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile("noots-storm-firebase.json")
});


var dbConn = builder.Configuration.GetSection("WriteDB").Value;
var storageConn = builder.Configuration.GetSection("Azure").Get<AzureConfig>();
var signalRConn = builder.Configuration.GetSection("SignalRUrl").Value;
var elasticConn = builder.Configuration.GetSection("ElasticConfiguration:Uri").Value;

var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

builder.Services.SetupLogger(builder.Configuration, environment);

builder.Services.AddHealthChecks()
                .AddElasticsearch(elasticConn)
                .AddHangfire(null)
                .AddNpgSql(dbConn)
                .AddSignalRHub($"{signalRConn}/hub")
                .AddCheck<AzureBlobStorageHealthChecker>("AzureBlobStorageChecker");

builder.Services.AddHealthChecksUI()
                .AddInMemoryStorage();

builder.Services.AzureConfig(storageConn);
builder.Services.TimersConfig(builder.Configuration);
builder.Services.JWT(builder.Configuration);


builder.Services.AddScoped<NoteFolderLabelMapper>();
builder.Services.AddScoped<AppTypesMapper>();
builder.Services.AddScoped<UserBackgroundMapper>();

builder.Services.AddControllers(opt => opt.Filters.Add(new ValidationFilter()))
                .AddNewtonsoftJson();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer(); // check

builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, IdProvider>();

builder.Services.Mediatr();

builder.Services.HangFireConfig(builder.Configuration);
builder.Services.DataBase(dbConn);

builder.Services.BI();
builder.Services.FileStorage();

builder.Services.AddMemoryCache();

// RATE LIMITER
//load general configuration from appsettings.json
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
//load ip rules from appsettings.json
builder.Services.Configure<IpRateLimitPolicies>(builder.Configuration.GetSection("IpRateLimitPolicies"));
// inject counter and rules stores
builder.Services.AddInMemoryRateLimiting();

builder.Services.AddHostedService<JobRegisterHosted>();
builder.Services.AddHostedService<ManageUsersOnEntitiesHosted>();
builder.Services.AddHostedService<SetupServicesHosted>();
builder.Services.AddHostedService<StartDBCleanerHosted>();


builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

builder.Services.AddHttpClient();

builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseIpRateLimiting();

app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseCors("MyPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHangfireDashboard();
app.MapHub<AppSignalRHub>("/hub");

// HEALTH CHECK
// /healthchecks-ui
app.MapHealthChecksUI();
app.MapHealthChecks("/app-health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});



await app.RunAsync();