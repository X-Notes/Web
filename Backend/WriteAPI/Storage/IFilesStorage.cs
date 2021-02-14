using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Storage
{
    public interface IFilesStorage : IDisposable
    {
        public void CreateUserFolders(Guid userId);
        public void CreateIfMissing();
    }
}
