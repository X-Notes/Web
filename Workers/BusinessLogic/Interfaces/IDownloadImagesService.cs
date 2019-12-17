using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Interfaces
{
    public interface IDownloadImagesService
    {
        Task<string> GetImage(string url);
    }
}
