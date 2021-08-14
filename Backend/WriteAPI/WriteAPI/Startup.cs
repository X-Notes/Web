using AutoMapper;
using BI.Mapping;
using BI.SignalR;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Hangfire;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WriteAPI.ConfigureAPP;
using WriteAPI.Filters;
using WriteAPI.Hosted;

namespace WriteAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", reloadOnChange: true, optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(o => o.AddPolicy("MyPolicy", builder =>
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

            services.AzureConfig(Configuration);
            services.JWT(Configuration);
                
            services.AddAutoMapper(typeof(UserProfile).Assembly);
            services.AddScoped<AppCustomMapper>();

            services.AddControllers(opt => opt.Filters.Add(new ValidationFilter()))
                .AddNewtonsoftJson();

            services.AddSignalR();
            services.AddSingleton<IUserIdProvider, IdProvider>();

            services.Mediatr();

            services.HangFireConfig(Configuration);
            services.DataBase(Configuration);

            services.BI();
            services.FileStorage();

            services.AddMemoryCache();

            services.AddHostedService<MLHosted>();
            services.AddHostedService<JobRegisterHosted>();

            services.AddHttpClient();

            services.AddSwaggerGen();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                System.Console.WriteLine("Development");
                app.UseDeveloperExceptionPage();
            }

            if(env.IsProduction())
            {
                System.Console.WriteLine("Production");
            }

            app.UseMiddleware<ExceptionMiddleware>();

            app.UseHttpsRedirection();

            // Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();

            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
            // specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
            });

            app.UseRouting();
            app.UseCors("MyPolicy");

            app.UseAuthentication();
            app.UseAuthorization();


            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHangfireDashboard();
                endpoints.MapHub<AppSignalRHub>("/hub");
            });
        }
    }
}
