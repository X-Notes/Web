using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Timers
{
    public class HostedTimersConfig
    {
        public int UnlockCallClearSeconds { set; get; }

        public int ManageUsersOnEntitiesCallClearSeconds { set; get; }

        public int ManageUsersOnEntitiesDeleteAfterHourse { set; get; }

        public int DeleteUnlinkedFilesAfterMinutes { set; get; }
    }
}
