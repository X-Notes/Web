using Common.DatabaseModels.models;
using Common.DTO.notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WriteAPI.ControllerConfig;
using WriteContext.Repositories;

namespace WriteAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase // TODO ADD TO MEDIATR
    {
        private readonly NotificationRepository notificationRepository;
        private readonly UserRepository userRepository;
        public NotificationController(NotificationRepository notificationRepository,
                                      UserRepository userRepository)
        {
            this.notificationRepository = notificationRepository;
            this.userRepository = userRepository;
        }


        [HttpGet]
        public async Task<IEnumerable<NotificationDTO>> GetNotifications(Guid userId)
        {
            var user = await userRepository.FirstOrDefault(x => x.Email == this.GetUserEmail());
            if(user != null)
            {
                var notifs = await this.notificationRepository.GetWhere(x => x.UserToId == user.Id);
                return notifs.Select(t => new NotificationDTO(t));
            }
            throw new Exception("User not found");
        }
    }
}
