using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common;
using Common.DTO;
using FirebaseAdmin;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteContext.Repositories.Users;

namespace WriteAPI.Controllers.UserContollers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository userRepository;

        public AuthController(UserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        [HttpPost("verify")]
        public async Task<OperationResult<Unit>> VerifyToken(TokenVerifyRequest request)
        {
            var auth = FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance;
            try
            {
                var response = await auth.VerifyIdTokenAsync(request.Token);
                if (response != null)
                {
                    var isHasEmail = response.Claims.ContainsKey("email");
                    if(isHasEmail)
                    {
                        var email = response.Claims["email"].ToString();
                        var user = await userRepository.FirstOrDefaultAsync(x => x.Email == email);
                        if (user != null)
                        {
                            var claims = new Dictionary<string, object>() { { "userId", user.Id }, { "IsHasProfile", true } };
                            await auth.SetCustomUserClaimsAsync(response.Uid, claims);
                        }
                    }
                    return new OperationResult<Unit>(true, Unit.Value);
                }
            }
            catch (FirebaseException ex)
            {
                System.Console.WriteLine(ex);
            }

            return new OperationResult<Unit>(false, Unit.Value, OperationResultAdditionalInfo.AnotherError);
        }

        [HttpGet("work")]
        public ActionResult GETSTATUS()
        {
            return Ok("WORK2");
        }

        [Authorize]
        [HttpGet("get")]
        public ActionResult GET()
        {
            return Ok();
        }
    }
}