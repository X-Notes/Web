using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using WriteAPI.ConstraintsUploadFiles;

namespace WriteAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.ConfigureKestrel((context, options) =>
                    {
                        // Handle requests up to  ~ 1500 MB
                        options.Limits.MaxRequestBodySize = FileSizeConstraints.MaxRequestFileSize; // TODO MAYBE MOVE
                    })
                    .UseStartup<Startup>();
                });

    }
}
