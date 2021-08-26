using System.Threading.Tasks;
using Common;
using FirebaseAdmin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WriteAPI.Controllers.UserContollers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyToken(TokenVerifyRequest request)
        {
            var auth = FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance;

            try
            {
                var response = await auth.VerifyIdTokenAsync(request.Token);
                if (response != null)
                    return Accepted();
            }
            catch (FirebaseException ex)
            {
                return BadRequest(ex);
            }

            return BadRequest();
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