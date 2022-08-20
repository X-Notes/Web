using FirebaseAdmin.Auth;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WriteContext.Repositories.Users;

namespace BI.Services.Auth
{
    public class FirebaseAuthService
    {
        private FirebaseAuth firebaseAuth = FirebaseAuth.DefaultInstance;

        private readonly UserRepository userRepository;
        private readonly ILogger<FirebaseAuthService> logger;

        public FirebaseAuthService(UserRepository userRepository, ILogger<FirebaseAuthService> logger)
        {
            this.userRepository = userRepository;
            this.logger = logger;
        }

        public async Task<bool> TrySetCustomClaims(string email, string uid)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == email);
            if (user != null)
            {
                var claims = new Dictionary<string, object>() { { "userId", user.Id }, { "IsHasProfile", true } };
                await firebaseAuth.SetCustomUserClaimsAsync(uid, claims);
                return true;
            }
            return false;
        }

        public async Task<bool> IsTokenValid(string token)
        {
            try
            {
                var response = await firebaseAuth.VerifyIdTokenAsync(token);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogError(ex.ToString());
            }

            return false;
        }
    }
}
