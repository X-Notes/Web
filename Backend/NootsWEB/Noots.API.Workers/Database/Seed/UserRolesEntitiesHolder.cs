using API.Worker.Database.Models;

namespace API.Worker.Database.Seed
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
