using Microsoft.AspNetCore.Identity;

namespace DatabaseContext
{
    public class User : IdentityUser
    {
        public int Year { get; set; }
    }
}
