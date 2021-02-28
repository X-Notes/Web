using AutoMapper;
using BI.Mapping;
using BI.signalR;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
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

            services.JWT(Configuration);
                
            services.AddAutoMapper(typeof(UserProfile).Assembly);
            services.AddScoped<NoteCustomMapper>();

            services.AddScoped<ValidationFilter>();
            services.AddControllers().AddNewtonsoftJson();

            services.AddSignalR();
            services.AddSingleton<IUserIdProvider, IdProvider>();

            services.Mediatr();
            services.DataBase(Configuration);
            services.BI();

            services.AddHostedService<StartAppHosted>();

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

            app.UseRouting();
            app.UseCors("MyPolicy");

            app.UseAuthentication();
            app.UseAuthorization();


            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<DocumentHub>("/hub");
            });
        }
    }
}
