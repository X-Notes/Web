using API.Worker.Database.Models;

namespace API.Worker.Database.Seed
{
    public class RolesEntitiesHolder
    {
        private List<Role> Roles = new List<Role>
        {
            new Role
            {
                Id = 1,
                Name = "admin",
                NormalizedName = "ADMIN",
                ConcurrencyStamp = "cda9194a-63f5-4643-afdd-78006aefd74b",
            },
        };

        public List<Role> GetRoles()
        {
            return Roles;
        }
    }
}