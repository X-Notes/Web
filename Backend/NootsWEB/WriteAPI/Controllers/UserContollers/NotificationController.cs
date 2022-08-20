using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Common.DTO.Notifications;
using Noots.DatabaseContext.Repositories.Notifications;
using WriteAPI.ControllerConfig;
using Noots.Mapper.Mapping;

namespace WriteAPI.Controllers.UserContollers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase // TODO ADD TO MEDIATR
    {
        private readonly NotificationRepository notificationRepository;

        private readonly NoteFolderLabelMapper noteFolderLabelMapper;

        public NotificationController(NotificationRepository notificationRepository,
                                      NoteFolderLabelMapper noteFolderLabelMapper)
        {
            this.notificationRepository = notificationRepository;
            this.noteFolderLabelMapper = noteFolderLabelMapper;
        }


        [HttpGet]
        public async Task<IEnumerable<NotificationDTO>> GetNotifications()
        {
            var notifs = await notificationRepository.GetByUserOrdered(this.GetUserId());
            return notifs.Select(t => new NotificationDTO(t, noteFolderLabelMapper.BuildFilePath));
        }

        [HttpGet("read/all")]
        public async Task<IActionResult> ReadAllNotifications()
        {
            var notifs = await notificationRepository
                .GetWhereAsync(x => x.UserToId == this.GetUserId() && x.IsRead == false);
            notifs.ForEach(x => x.IsRead = true);
            await notificationRepository.UpdateRangeAsync(notifs);
            return Ok();
        }

        [HttpGet("read/{id}")]
        public async Task<IActionResult> ReadAllNotifications(Guid id)
        {
            var notif = await notificationRepository.FirstOrDefaultAsync(x => x.UserToId == this.GetUserId() && x.Id == id);
            notif.IsRead = true;
            await notificationRepository.UpdateAsync(notif);
            return Ok();
        }
    }
}
