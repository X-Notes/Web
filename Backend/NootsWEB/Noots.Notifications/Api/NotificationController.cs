using Common;
using Common.DTO.Notifications;
using Common.Filters;
using Mapper.Mapping;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Noots.DatabaseContext.Repositories.Notifications;

namespace Notifications.Api;

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
    [ValidationRequireUserIdFilter]
    public async Task<IEnumerable<NotificationDTO>> GetNotifications()
    {
        var notifs = await notificationRepository.GetByUserOrdered(this.GetUserId());
        return notifs.Select(t => new NotificationDTO(t, noteFolderLabelMapper.GetUserProfilePhotoPath(t.UserFrom)));
    }

    [HttpGet("read/all")]
    [ValidationRequireUserIdFilter]
    public async Task<IActionResult> ReadAllNotifications()
    {
        var notifs = await notificationRepository
            .GetWhereAsync(x => x.UserToId == this.GetUserId() && x.IsRead == false);
        notifs.ForEach(x => x.IsRead = true);
        await notificationRepository.UpdateRangeAsync(notifs);
        return Ok();
    }

    [HttpGet("read/{id}")]
    [ValidationRequireUserIdFilter]
    public async Task<IActionResult> ReadAllNotifications(Guid id)
    {
        var notif = await notificationRepository.FirstOrDefaultAsync(x => x.UserToId == this.GetUserId() && x.Id == id);
        notif.IsRead = true;
        await notificationRepository.UpdateAsync(notif);
        return Ok();
    }
}