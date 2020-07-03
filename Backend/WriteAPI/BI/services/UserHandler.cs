using Domain.Commands;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories;

namespace BI.services
{
    public class UserHandler
    {
        private readonly UserRepository userRepository;

        public UserHandler(UserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        public async Task HandleRaw(string value)
        {

            var deserialized = JsonConvert.DeserializeObject<CommandGet>(value);
            var messageType = Type.GetType($"{deserialized.Type}");
            var type = JsonConvert.DeserializeObject(Convert.ToString(deserialized.Data), messageType);

            switch (type)
            {
                case NewUser command:
                    {
                        await Handle(command);
                        break;
                    }
                case UpdateMainUserInfo command:
                    {
                        await Handle(command);
                        break;
                    }
            }
        }
        private async Task Handle(NewUser user)
        {

        }
        private async Task Handle(UpdateMainUserInfo info)
        {

        }
    }
}
