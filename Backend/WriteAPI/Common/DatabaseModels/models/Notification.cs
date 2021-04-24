using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.models
{
    public class Notification : BaseEntity
    {
        public Guid? UserFromId { set; get; }
        public User UserFrom { set; get; }
        public Guid UserToId { set; get; }
        public User UserTo { set; get; }
        public bool IsSystemMessage { set; get; }
        public bool IsRead { set; get; }
        public string Message { set; get; }
        public DateTimeOffset Date { set; get; }
    }
}
