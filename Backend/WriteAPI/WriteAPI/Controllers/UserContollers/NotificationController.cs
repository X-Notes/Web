using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Notifications;
using WriteAPI.ControllerConfig;
using WriteContext.Repositories.Notifications;
using WriteContext.Repositories.Users;

namespace WriteAPI.Controllers.UserContollers
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
        public async Task<IEnumerable<NotificationDTO>> GetNotifications()
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == this.GetUserEmail());
            if (user != null)
            {
                var notifs = await notificationRepository.GetByUserOrdered(user.Id);
                return notifs.Select(t => new NotificationDTO(t));
            }
            throw new Exception("User not found");
        }

        [HttpGet("read/all")]
        public async Task<IActionResult> ReadAllNotifications()
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == this.GetUserEmail());
            if (user != null)
            {
                var notifs = await notificationRepository
                    .GetWhereAsync(x => x.UserToId == user.Id && x.IsRead == false);
                notifs.ForEach(x => x.IsRead = true);
                await notificationRepository.UpdateRangeAsync(notifs);
                return Ok();
            }
            throw new Exception("User not found");
        }

        [HttpGet("read/{id}")]
        public async Task<IActionResult> ReadAllNotifications(Guid id)
        {
            var user = await userRepository.FirstOrDefaultAsync(x => x.Email == this.GetUserEmail());
            if (user != null)
            {
                var notif = await notificationRepository.FirstOrDefaultAsync(x => x.UserToId == user.Id && x.Id == id);
                notif.IsRead = true;
                await notificationRepository.UpdateAsync(notif);
                return Ok();
            }
            throw new Exception("User not found");
        }
    }
}
