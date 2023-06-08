using Noots.API.Workers.Database.Models;

namespace Noots.API.Workers.Database.Seed
{
    public class UserRolesEntitiesHolder
    {
        private List<UserRole> UserRoles = new List<UserRole>
        {
            new UserRole
            {
                RoleId = 1,
                UserId = 1,
            }
        };

        public List<UserRole> GetUserRoles()
        {
            return UserRoles;
        }
    }
}
