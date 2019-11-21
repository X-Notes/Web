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
            await habr.GetSite();
        }
    }
}
