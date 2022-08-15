using System.Threading.Tasks;
using WriteContext.Repositories.Users;

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
            await userRepository.AddRangeAsync(users);
        }

    }
}
