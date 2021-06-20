using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Systems;
using Common.DTO.app;
using System;

namespace Common.DTO.users
{
    public class InvitedUsersToFoldersOrNote
    {
        public Guid Id { set; get; }
        public Guid PhotoId { set; get; }
        public string PhotoPath { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public RefTypeENUM AccessTypeId { set; get; }
    }
}
