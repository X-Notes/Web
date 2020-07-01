using Domain.Commands;
using Domain.Ids;
using Domain.Models;
using Domain.Repository;
using Marten;
using Marten.Events;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WriteAPI.Services;

namespace WriteAPI
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.Queue(Configuration);

            services.AddControllers().AddNewtonsoftJson();

            services.AddSingleton<CommandsPushQueue>();
            services.AddHostedService<CommandsGetQueue>();

            var connection = Configuration.GetSection("EventStore").Value;

            services.AddMarten(opts =>
            {
   
                opts.Connection(connection);
                opts.AutoCreateSchemaObjects = AutoCreate.All;

                opts.Events.AsyncProjections.AggregateStreamsWith<User>();


                opts.Events.AddEventType(typeof(NewUser));
                opts.Events.AddEventType(typeof(UpdateMainUserInfo));
            });

            services.AddScoped<IIdGenerator, MartenIdGenerator>();
            services.AddTransient<IRepository<User>, MartenRepository<User>>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
