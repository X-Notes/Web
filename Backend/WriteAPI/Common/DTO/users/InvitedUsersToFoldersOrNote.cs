using Common.DatabaseModels.helpers;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.users
{
    public class InvitedUsersToFoldersOrNote
    {
        public Guid Id { set; get; }
        public Guid PhotoId { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public RefType AccessType { set; get; }
    }
}
