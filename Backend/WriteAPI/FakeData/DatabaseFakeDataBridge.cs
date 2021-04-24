using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace FakeData
{
    public class DatabaseFakeDataBridge
    {
        private readonly UserRepository userRepository;
        private readonly UserGenerator userGenerator;
        public DatabaseFakeDataBridge(UserGenerator userGenerator,
            UserRepository userRepository)
        {
            this.userGenerator = userGenerator;
            this.userRepository = userRepository;
        }

        public async Task SetUsers(int count)
        {
            var users = userGenerator.GetUsers(count);
            await userRepository.AddRange(users);
        }

    }
}
