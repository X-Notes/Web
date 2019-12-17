using BusinessLogic.Interfaces;
using BusinessLogic.Services;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;
using Workers.Starting;

namespace Workers
{
    class Program
    {
        static async Task Main(string[] args)
        {
            RegisterServices services = new RegisterServices();
            var provider = services.services.BuildServiceProvider();


            var system = provider.GetService<IControlSystem>();
            system.Run();
            Console.ReadKey();
        }
    }
}
