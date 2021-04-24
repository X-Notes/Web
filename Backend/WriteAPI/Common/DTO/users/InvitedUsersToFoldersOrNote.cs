using Common.DatabaseModels.models;
using Common.DTO.app;
using System;

namespace Common.DTO.users
{
    public class InvitedUsersToFoldersOrNote
    {
        public Guid Id { set; get; }
        public Guid PhotoId { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public Guid AccessTypeId { set; get; }
        public RefTypeDTO AccessType { set; get; }
    }
}
