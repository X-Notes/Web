using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Interfaces
{
    public interface IHabr
    {
        Task<List<List<string>>> ParseMainPages(int pages);
        Task ParseConcretePages(List<List<string>> ListPages);
    }
}
