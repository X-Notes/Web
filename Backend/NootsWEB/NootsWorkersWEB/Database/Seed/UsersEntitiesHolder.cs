using NootsWorkersWEB.Database.Models;

namespace NootsWorkersWEB.Database.Seed
{
    public class UsersEntitiesHolder
    {
        private List<User> Users = new List<User>
        {
            new User
            {
                Id = 1,
                UserName="admin",
                Email ="admin@test.com",
                NormalizedUserName ="admin".ToUpper(),
                NormalizedEmail ="admin@test.com".ToUpper(),
                PasswordHash = "AQAAAAEAACcQAAAAEJMqefM3jQQE7sOvJCM73AKmMaFQqF0t01IbCdmU+x7KcgHlBoETO6+XXtvJ+wB9UA==",
                ConcurrencyStamp = "cda9194a-63f5-4643-afdd-78006aefd74b",
                FirstName = "Admin",
                LastName = "Administrator",
                TwoFactorEnabled = false
            }
        };

        public List<User> GetUsers()
        {
            return Users;
        }
    }
}
