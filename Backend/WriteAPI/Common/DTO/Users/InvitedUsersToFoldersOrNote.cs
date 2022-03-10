using System;
using Common.DatabaseModels.Models.Systems;

namespace Common.DTO.Users
{
    public class InvitedUsersToFoldersOrNote
    {
        public Guid Id { set; get; }

        public Guid PhotoId { set; get; }

        public string PhotoPath { set; get; }

        public string DefaultPhotoURL { set; get; }

        public string Name { set; get; }

        public string Email { set; get; }

        public RefTypeENUM AccessTypeId { set; get; }
    }
}
