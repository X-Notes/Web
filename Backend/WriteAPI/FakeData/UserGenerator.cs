using Bogus;
using Common.DatabaseModels.models;
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

                .RuleFor(u => u.LanguageId, f => Guid.Parse("38b402a0-e1b1-42d7-b472-db788a1a3924"))
                .RuleFor(u => u.ThemeId, f => Guid.Parse("f52a188b-5422-4144-91f6-bde40b82ce22"))
                .RuleFor(u => u.FontSizeId, f => Guid.Parse("5c335a93-7aa7-40ff-b995-6c90f2536e98"));
        }

        public List<User> GetUsers(int count)
        {
            return Enumerable.Range(0, count).Select(x => fakeUsers.Generate()).ToList();
        }
    }
}
