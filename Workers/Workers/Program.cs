using BusinessLogic.Interfaces;
using BusinessLogic.Services;
using System;
using System.Threading.Tasks;

namespace Workers
{
    class Program
    {
        static async Task Main(string[] args)
        {
            IHabr habr = new Habr();
            var articles = await habr.ParsePages(50);
            Console.WriteLine(articles);
        }
    }
}
