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
        static void Main(string[] args)
        {
            RegisterServices services = new RegisterServices();
            var provider = services.services.BuildServiceProvider();


            var habr = provider.GetService<IHabr>();
            habr.Run();
        }
    }
}
