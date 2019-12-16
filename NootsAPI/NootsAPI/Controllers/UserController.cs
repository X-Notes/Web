using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.BusinessLogic.Interfaces;
using NootsAPI.Infastructure;
using Shared.DTO.User;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NootsAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        IUserService userService;
        public UserController(IUserService userService)
        {
            this.userService = userService;
        }
        // GET: api/<controller>
        [HttpGet]
        public async Task<DTOUser> Get()
        {
            var currentUserEmail = this.GetUserEmail();
            var user = await this.userService.GetByEmail(currentUserEmail);
            return user;
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public void Get(int id)
        {

        }

        // POST api/<controller>
        [HttpPost]
        public async Task<DTOUser> Authorize([FromBody]DTOUser user)
        {
            var currentUserEmail = this.GetUserEmail();
            await this.userService.Add(user);
            var dbuser = await userService.GetByEmail(currentUserEmail);
            return dbuser;
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {

        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
