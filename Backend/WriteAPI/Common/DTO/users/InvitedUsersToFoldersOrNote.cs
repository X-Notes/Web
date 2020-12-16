using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.users
{
    public class InvitedUsersToFoldersOrNote
    {
        public int Id { set; get; }
        public string PhotoId { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public RefType AccessType { set; get; }
    }
}
