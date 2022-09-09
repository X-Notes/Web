using Bogus;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Common.DatabaseModels.Models.Systems;
using Common.DatabaseModels.Models.Users;
using Common.DatabaseModels.Models.Plan;

namespace FakeData
{
    public class UserGenerator
    {
        private readonly Faker<User> fakeUsers = new Faker<User>();

        public UserGenerator()
        {
            fakeUsers
                .RuleFor(u => u.Name, (f, y) => f.Internet.UserName(y.Name))
                .RuleFor(u => u.Email, (f, u) => f.Internet.Email(u.Name))
                .RuleFor(u => u.DefaultPhotoUrl, (f, y) => "https://lh3.googleusercontent.com/-l2fMop7j1hw/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rcL2pg2Nfx60NEpPT4jrHIfRDdfzg/photo.jpg")

                .RuleFor(u => u.BillingPlanId, (f, u) => BillingPlanTypeENUM.Standart)
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
