using NootsWorkersWEB.Database.Models;
using NootsWorkersWEB.Database;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var configBuilder = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", reloadOnChange: true, optional: true)
    .AddEnvironmentVariables();

builder.Configuration.AddConfiguration(configBuilder.Build());

// INIT IDENTITY DB
var appDb = builder.Configuration.GetSection("DatabaseConnection").Value;
builder.Services.AddDbContext<ApplicationDatabaseContext>(options => options.UseNpgsql(appDb));
builder.Services.AddIdentity<User, Role>()
    .AddEntityFrameworkStores<ApplicationDatabaseContext>();
//

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

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapHealthChecks("/health");

app.Run();
