using Domain.Commands;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain
{
    public static class FactoryQueueCommand
    {
        public static string Transform<T>(T Data)
        {
            var command  = new CommandGet()
            {
                Type = typeof(T).AssemblyQualifiedName,
                Data = Data
            };
            return JsonConvert.SerializeObject(command);
        }
        /*
            var str = FactoryQueueCommand.Transform(user);
            commandsPushQueue.CommandNewUser(str);
         */
    }
}
