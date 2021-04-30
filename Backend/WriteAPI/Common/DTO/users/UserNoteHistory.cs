using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO.users
{
    public class UserNoteHistory
    {
        public Guid Id { set; get; }
        public Guid? PhotoId { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }

        public UserNoteHistory()
        {

        }

    }
}
