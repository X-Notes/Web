using Bogus;
using Common.DatabaseModels.models.Systems;
using Common.DatabaseModels.models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FakeData
{
    public class UserGenerator
    {
        private readonly Faker<User> fakeUsers = new Faker<User>();

        public UserGenerator()
        {
            fakeUsers
                .RuleFor(u => u.Id, y => Guid.NewGuid())

                .RuleFor(u => u.Name, (f, y) => f.Internet.UserName(y.Name))
                .RuleFor(u => u.Email, (f, u) => f.Internet.Email(u.Name))

                .RuleFor(u => u.LanguageId, f => LanguageENUM.English)
                .RuleFor(u => u.ThemeId, f => ThemeENUM.Dark)
                .RuleFor(u => u.FontSizeId, f => FontSizeENUM.Medium);
        }

        public List<User> GetUsers(int count)
        {
            return Enumerable.Range(0, count).Select(x => fakeUsers.Generate()).ToList();
        }
    }
}
