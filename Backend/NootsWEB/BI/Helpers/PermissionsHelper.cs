using Common.DTO.Permissions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace BI.Helpers
{
    public static class PermissionsHelper
    {
        public static List<Guid> GetAllUsers(this UserPermissionsForNote perm)
        {
            var userIds = perm.Note.UsersOnPrivateNotes.Select(z => z.UserId).ToList();
            userIds.Add(perm.Author.Id);
            return userIds;
        }

        public static List<Guid> GetAllUsers(this UserPermissionsForFolder perm)
        {
            var userIds = perm.Folder.UsersOnPrivateFolders.Select(z => z.UserId).ToList();
            userIds.Add(perm.Author.Id);
            return userIds;
        }
    }
}
