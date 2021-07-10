using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WriteAPI.ControllerConfig
{
    public static class ControllerExtensions
    {
        public static string GetUserEmail(this ControllerBase controller)
        {
            var email = controller.User.Claims.FirstOrDefault(x => x.Type.Contains("emailaddress"))?.Value;
            return email;
        }
    }
}
