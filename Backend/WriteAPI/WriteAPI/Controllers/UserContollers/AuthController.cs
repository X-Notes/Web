using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BI.Services.Auth;
using Common;
using Common.DTO;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAPI.ControllerConfig;
using WriteContext.Repositories.Users;

namespace WriteAPI.Controllers.UserContollers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserRepository userRepository;
        private readonly FirebaseAuthService firebaseAuth;

        public AuthController(UserRepository userRepository, FirebaseAuthService firebaseAuth)
        {
            this.userRepository = userRepository;
            this.firebaseAuth = firebaseAuth;
        }

        [HttpPost("verify")]
        public async Task<OperationResult<Unit>> VerifyToken(TokenVerifyRequest request)
        {
            var isValid = await firebaseAuth.IsTokenValid(request.Token);
            if (isValid)
            {
                return new OperationResult<Unit>(true, Unit.Value);
            }
            return new OperationResult<Unit>(false, Unit.Value, OperationResultAdditionalInfo.AnotherError);
        }

        [HttpGet("set")]
        [Authorize]
        public async Task<OperationResult<Unit>> SetClaims()
        {
            var email = this.GetUserEmail();
            var uid = this.GetFirebaseUID();

            if(string.IsNullOrEmpty(email) || string.IsNullOrEmpty(uid) || string.IsNullOrEmpty(uid))
            {
                return new OperationResult<Unit>(false, Unit.Value, OperationResultAdditionalInfo.AnotherError);
            }
            
            var result = await firebaseAuth.TrySetCustomClaims(email, uid);
            if (!result)
            {
                return new OperationResult<Unit>(false, Unit.Value, OperationResultAdditionalInfo.NotFound);
            }

            return new OperationResult<Unit>(true, Unit.Value);
        }

        [HttpGet("status")]
        public ActionResult GETSTATUS()
        {
            return Ok("Ok");
        }

        [Authorize]
        [HttpGet("get")]
        public ActionResult GET()
        {
            return Ok("Ok");
        }
    }
}